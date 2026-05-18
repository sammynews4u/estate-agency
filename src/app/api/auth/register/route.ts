import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users, wallets, advertiserProfiles, publisherProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['advertiser', 'publisher']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Advertiser fields
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  // Publisher fields
  blogUrl: z.string().optional(),
  socialMedia: z.record(z.string(), z.string()).optional(),
  niches: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const [user] = await db.insert(users).values({
      email: validated.email.toLowerCase(),
      passwordHash,
      role: validated.role,
      firstName: validated.firstName,
      lastName: validated.lastName,
      status: 'pending',
    }).returning();

    // Create wallet
    await db.insert(wallets).values({
      userId: user.id,
      balance: '0.00',
    });

    // Create role-specific profile
    if (validated.role === 'advertiser') {
      await db.insert(advertiserProfiles).values({
        userId: user.id,
        companyName: validated.companyName || null,
        website: validated.website || null,
        industry: validated.industry || null,
        country: validated.country || null,
      });
    } else if (validated.role === 'publisher') {
      // Generate unique tracking pixel code for this publisher
      const pixelId = uuidv4().replace(/-/g, '').substring(0, 16);

      await db.insert(publisherProfiles).values({
        userId: user.id,
        websiteUrl: validated.blogUrl || null,
        socialMedia: validated.socialMedia || null,
        niches: validated.niches || [],
      });
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

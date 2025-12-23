import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import type { Plan, PlanPrice, PlanFeature } from '@prisma/generated/client';

export interface AdminPlanFilters {
  search?: string;
  isActive?: boolean;
  currency?: string;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface AdminPlansConnection {
  nodes: any[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface CreatePlanInput {
  slug: string;
  name: string;
  description?: string;
  maxActiveProjects?: number;
  maxMembers: number;
  storageGB: number;
  isPopular?: boolean;
  sortOrder?: number;
  prices: CreatePlanPriceInput[];
  features: CreatePlanFeatureInput[];
}

export interface CreatePlanPriceInput {
  currency: string;
  price: number;
  earlyBirdPrice: number;
  billingCycleDays?: number;
}

export interface CreatePlanFeatureInput {
  name: string;
  description?: string;
  isIncluded?: boolean;
  sortOrder?: number;
}

export interface UpdatePlanInput {
  slug?: string;
  name?: string;
  description?: string;
  maxActiveProjects?: number;
  maxMembers?: number;
  storageGB?: number;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  prices?: CreatePlanPriceInput[];
  features?: CreatePlanFeatureInput[];
}

export interface PlanWithRelations extends Plan {
  prices: PlanPrice[];
  features: PlanFeature[];
  _count?: {
    subscriptions: number;
  };
}

@Injectable()
export class AdminPlansService {
  private readonly logger = new Logger(AdminPlansService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AdminActionLogService,
  ) {}

  /**
   * Get paginated list of plans with filters
   */
  async findAll(
    filters: AdminPlanFilters = {},
    pagination?: PaginationInput,
  ): Promise<AdminPlansConnection | PlanWithRelations[]> {
    this.logger.log(`Fetching plans with filters: ${JSON.stringify(filters)}`);

    const where: any = {};

    // Search filter (name, slug, description)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Active filter (only add if explicitly set, not null)
    if (filters.isActive !== undefined && filters.isActive !== null) {
      where.isActive = filters.isActive;
    }

    // Currency filter (for prices)
    const priceWhere: any = filters.currency
      ? { currency: filters.currency }
      : undefined;

    // If pagination not provided, return all plans
    if (!pagination) {
      const plans = await this.prisma.plan.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        include: {
          prices: priceWhere ? { where: priceWhere } : true,
          features: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      return plans;
    }

    // Get total count
    const totalCount = await this.prisma.plan.count({ where });

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;
    const totalPages = Math.ceil(totalCount / pagination.limit);

    // Get plans
    const nodes = await this.prisma.plan.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { sortOrder: 'asc' },
      include: {
        prices: priceWhere ? { where: priceWhere } : true,
        features: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return {
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages,
      },
    };
  }

  /**
   * Get detailed information about a plan
   */
  async findOne(planId: string): Promise<PlanWithRelations> {
    this.logger.log(`Fetching plan details for ID: ${planId}`);

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          orderBy: { currency: 'asc' },
        },
        features: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    return plan;
  }

  /**
   * Get plan by slug
   */
  async findBySlug(slug: string): Promise<PlanWithRelations> {
    this.logger.log(`Fetching plan by slug: ${slug}`);

    const plan = await this.prisma.plan.findUnique({
      where: { slug },
      include: {
        prices: {
          orderBy: { currency: 'asc' },
        },
        features: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with slug "${slug}" not found`);
    }

    return plan;
  }

  /**
   * Create a new plan with prices and features
   */
  async create(input: CreatePlanInput, adminId: string): Promise<PlanWithRelations> {
    this.logger.log(`Creating plan "${input.name}" by admin ${adminId}`);

    // Validate slug uniqueness
    const existingPlan = await this.prisma.plan.findUnique({
      where: { slug: input.slug },
    });

    if (existingPlan) {
      throw new BadRequestException(`Plan with slug "${input.slug}" already exists`);
    }

    // Validate at least one price
    if (!input.prices || input.prices.length === 0) {
      throw new BadRequestException('Plan must have at least one price');
    }

    // Create plan with nested prices and features
    const plan = await this.prisma.plan.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        maxActiveProjects: input.maxActiveProjects,
        maxMembers: input.maxMembers,
        storageGB: input.storageGB,
        isPopular: input.isPopular || false,
        sortOrder: input.sortOrder ?? 0,
        isActive: true, // New plans are active by default
        prices: {
          create: input.prices.map((price) => ({
            currency: price.currency.toUpperCase(),
            price: price.price,
            earlyBirdPrice: price.earlyBirdPrice,
            billingCycleDays: price.billingCycleDays || 30,
          })),
        },
        features: {
          create: input.features.map((feature, index) => ({
            name: feature.name,
            description: feature.description,
            isIncluded: feature.isIncluded ?? true,
            sortOrder: feature.sortOrder ?? index,
          })),
        },
      },
      include: {
        prices: true,
        features: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'CREATE_PLAN',
      resource: 'Plan',
      resourceId: plan.id,
      details: {
        slug: plan.slug,
        name: plan.name,
        pricesCount: input.prices.length,
        featuresCount: input.features.length,
      },
    });

    this.logger.log(`Plan created successfully: ${plan.id}`);

    return plan;
  }

  /**
   * Update a plan
   */
  async update(
    planId: string,
    input: UpdatePlanInput,
    adminId: string,
  ): Promise<PlanWithRelations> {
    this.logger.log(`Updating plan ${planId} by admin ${adminId}`);

    // Get current plan state
    const planBefore = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: true,
        features: true,
      },
    });

    if (!planBefore) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    // Validate slug uniqueness if changing
    if (input.slug && input.slug !== planBefore.slug) {
      const existingPlan = await this.prisma.plan.findUnique({
        where: { slug: input.slug },
      });

      if (existingPlan) {
        throw new BadRequestException(`Plan with slug "${input.slug}" already exists`);
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.maxActiveProjects !== undefined) updateData.maxActiveProjects = input.maxActiveProjects;
    if (input.maxMembers !== undefined) updateData.maxMembers = input.maxMembers;
    if (input.storageGB !== undefined) updateData.storageGB = input.storageGB;
    if (input.isPopular !== undefined) updateData.isPopular = input.isPopular;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Update plan in transaction
    const planAfter = await this.prisma.$transaction(async (tx) => {
      // Update basic plan data
      const updatedPlan = await tx.plan.update({
        where: { id: planId },
        data: updateData,
      });

      // Update prices if provided
      if (input.prices) {
        // Delete existing prices
        await tx.planPrice.deleteMany({
          where: { planId },
        });

        // Create new prices
        await tx.planPrice.createMany({
          data: input.prices.map((price) => ({
            planId,
            currency: price.currency.toUpperCase(),
            price: price.price,
            earlyBirdPrice: price.earlyBirdPrice,
            billingCycleDays: price.billingCycleDays || 30,
          })),
        });
      }

      // Update features if provided
      if (input.features) {
        // Delete existing features
        await tx.planFeature.deleteMany({
          where: { planId },
        });

        // Create new features
        await tx.planFeature.createMany({
          data: input.features.map((feature, index) => ({
            planId,
            name: feature.name,
            description: feature.description,
            isIncluded: feature.isIncluded ?? true,
            sortOrder: feature.sortOrder ?? index,
          })),
        });
      }

      // Return updated plan with relations
      return tx.plan.findUnique({
        where: { id: planId },
        include: {
          prices: true,
          features: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'UPDATE_PLAN',
      resource: 'Plan',
      resourceId: planId,
      details: {
        before: {
          name: planBefore.name,
          slug: planBefore.slug,
          isActive: planBefore.isActive,
        },
        after: {
          name: planAfter!.name,
          slug: planAfter!.slug,
          isActive: planAfter!.isActive,
        },
        updatedFields: Object.keys(input),
      },
    });

    this.logger.log(`Plan updated successfully: ${planId}`);

    return planAfter!;
  }

  /**
   * Archive a plan (set isActive = false)
   */
  async archive(planId: string, adminId: string): Promise<Plan> {
    this.logger.log(`Archiving plan ${planId} by admin ${adminId}`);

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    if (!plan.isActive) {
      throw new BadRequestException('Plan is already archived');
    }

    // Update plan
    const archivedPlan = await this.prisma.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'ARCHIVE_PLAN',
      resource: 'Plan',
      resourceId: planId,
      details: {
        name: plan.name,
        slug: plan.slug,
      },
    });

    this.logger.log(`Plan archived successfully: ${planId}`);

    return archivedPlan;
  }

  /**
   * Activate a plan (set isActive = true)
   */
  async activate(planId: string, adminId: string): Promise<Plan> {
    this.logger.log(`Activating plan ${planId} by admin ${adminId}`);

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    if (plan.isActive) {
      throw new BadRequestException('Plan is already active');
    }

    // Update plan
    const activatedPlan = await this.prisma.plan.update({
      where: { id: planId },
      data: { isActive: true },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'ACTIVATE_PLAN',
      resource: 'Plan',
      resourceId: planId,
      details: {
        name: plan.name,
        slug: plan.slug,
      },
    });

    this.logger.log(`Plan activated successfully: ${planId}`);

    return activatedPlan;
  }

  /**
   * Delete a plan (hard delete)
   * Only allowed if no active subscriptions exist
   */
  async delete(planId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Deleting plan ${planId} by admin ${adminId}`);

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    // Check for active subscriptions
    const activeSubscriptionsCount = await this.prisma.subscription.count({
      where: {
        planId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptionsCount > 0) {
      throw new BadRequestException(
        `Cannot delete plan with ${activeSubscriptionsCount} active subscription(s). Archive the plan instead.`,
      );
    }

    // Log action before deletion
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'DELETE_PLAN',
      resource: 'Plan',
      resourceId: planId,
      details: {
        name: plan.name,
        slug: plan.slug,
        totalSubscriptions: plan._count.subscriptions,
        isActive: plan.isActive,
      },
    });

    // Delete plan (cascade deletes prices and features)
    await this.prisma.plan.delete({
      where: { id: planId },
    });

    this.logger.log(`Plan deleted successfully: ${planId}`);

    return true;
  }

  /**
   * Get plans available for public (active plans only)
   */
  async getAvailablePlans(currency?: string): Promise<PlanWithRelations[]> {
    this.logger.log(`Fetching available plans for currency: ${currency || 'all'}`);

    const priceWhere: any = currency
      ? { currency: currency.toUpperCase() }
      : undefined;

    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        prices: priceWhere ? { where: priceWhere } : true,
        features: {
          where: { isIncluded: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return plans;
  }
}

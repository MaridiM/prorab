import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../payments.service';
import { StripeProvider } from '../../../core/payments/providers/stripe.provider';
import { PaymentProviderFactory } from '../../../core/payments/factories/payment-provider.factory';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripeProvider: StripeProvider | null = null;

  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService,
    private paymentProviderFactory: PaymentProviderFactory,
  ) {
    // Get Stripe provider instance for signature verification
    this.initializeStripeProvider();
  }

  private async initializeStripeProvider() {
    try {
      const provider = await this.paymentProviderFactory.getProvider(
        'STRIPE' as any,
      );
      if (provider instanceof StripeProvider) {
        this.stripeProvider = provider;
      }
    } catch (error) {
      this.logger.warn('Failed to initialize Stripe provider for webhook verification');
    }
  }

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    // Get raw body for signature verification
    const rawBody = req.rawBody 
      ? (Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf-8') : req.rawBody)
      : JSON.stringify(req.body);
    
    // Parse event from body
    const event = req.body as Stripe.Event;
    
    this.logger.log(`Received Stripe webhook: ${event.type}`);

    // Verify webhook signature
    if (this.stripeProvider && signature) {
      const isValid = this.stripeProvider.verifyWebhookSignature(
        rawBody,
        signature,
      );
      
      if (!isValid) {
        this.logger.error('Invalid Stripe webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
      this.logger.debug('Stripe webhook signature verified successfully');
    } else {
      this.logger.warn('Stripe webhook secret not configured - skipping signature verification');
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          this.logger.warn(`Unhandled Stripe webhook event: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Stripe webhook processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle checkout.session.completed event
   * This is triggered when a customer completes a checkout session
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout session completed: ${session.id}`);
    
    // Extract metadata from session (contains targetPlanId and targetPlan if plan change was requested)
    const metadata = session.metadata || {};
    
    // Get payment intent ID from session
    const paymentIntentId = 
      typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : (session.payment_intent as Stripe.PaymentIntent)?.id;

    if (paymentIntentId) {
      // Use the payment intent handler with metadata
      await this.handlePaymentIntentSucceeded({
        id: paymentIntentId,
        metadata: metadata,
      } as Stripe.PaymentIntent);
    } else {
      // Fallback: try to find payment by session ID with metadata
      await this.paymentsService.handleStripePaymentSucceeded(session.id, metadata as Record<string, string>);
    }
  }

  /**
   * Handle payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
    // Extract metadata from payment intent (contains targetPlanId and targetPlan if plan change was requested)
    const metadata = paymentIntent.metadata || {};
    await this.paymentsService.handleStripePaymentSucceeded(paymentIntent.id, metadata as Record<string, string>);
  }

  /**
   * Handle payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.warn(`Payment intent failed: ${paymentIntent.id}`);
    const reason = paymentIntent.last_payment_error?.message || 'Payment failed';
    await this.paymentsService.handleStripePaymentFailed(paymentIntent.id, reason);
  }

  /**
   * Handle charge.refunded event
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    this.logger.log(`Charge refunded: ${charge.id}`);
    const paymentIntentId = typeof charge.payment_intent === 'string' 
      ? charge.payment_intent 
      : charge.payment_intent?.id;
    
    if (paymentIntentId) {
      await this.paymentsService.handleStripeRefundSucceeded(charge.id, paymentIntentId);
    }
  }

  /**
   * Handle customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Handle subscription updates if needed
    // This could be used to sync subscription status changes
  }

  /**
   * Handle customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Handle subscription cancellation if needed
  }
}


# Third-Party Audit Checklist

Use this before enabling ads, GTM, analytics, payment experiments, or affiliates.

## Google Tag Manager

- Keep `NEXT_PUBLIC_GTM_ID` blank until the GTM container is audited.
- Export the GTM container JSON before every production change.
- Confirm every tag owner, trigger, and destination domain.
- Block unknown redirect, iframe, checkout, payment, popup, and affiliate tags.
- Verify no tag can inject arbitrary payment forms.
- Verify consent mode and cookie behavior.
- Retest checkout after GTM changes with browser devtools open.

## Stripe

- Product catalog screenshot shows two active products:
  - `$999` billed per year.
  - `$99/m` billed per month.
- Confirm every configured price ID belongs to the StutterLab Stripe account.
- Copy the actual Stripe price IDs, not product names, into:
  - `STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_1T6wSKDQ3dxBuCnuMRyOOnFL`
  - `STRIPE_PRICE_ID_PREMIUM_YEARLY=price_1T6wVRDQ3dxBuCnufvCpwEXH`
- Confirm statement descriptor says StutterLab or an unmistakable legal entity.
- Confirm embedded checkout domain is the production StutterLab domain.
- Confirm billing portal return URL points to StutterLab.
- Confirm webhook endpoint is live and signature secret matches production.
- Test monthly and yearly checkout with Stripe test cards before release.
- Test cancellation and refund path from settings.

## Analytics And Ads

- List every third-party script in production.
- Confirm no ad pixel can redirect, overlay, or open checkout.
- Confirm all analytics vendors are disclosed in privacy policy.
- Confirm opt-out requirements by region.

## Incident Response

- If a user reports an unfamiliar charge, treat it as a trust incident.
- Check Stripe customer, subscription, invoice, and payment intent history.
- Check GTM publish history around the incident timestamp.
- Check server logs for checkout/session-status/webhook events.
- Reply with what was checked, what was found, and the refund path.

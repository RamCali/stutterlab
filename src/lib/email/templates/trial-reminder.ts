export function buildTrialReminderEmail(params: {
  userName: string;
  trialEndDate: string;
  billingAmount: string;
  manageUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Your StutterLab trial ends tomorrow",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background: #fafafa;">
  <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
    <img src="${params.manageUrl.replace("/app/settings", "/logo/StutterLab_Logo.svg")}" alt="StutterLab" width="160" style="margin-bottom: 24px;" />
    <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">Hi ${params.userName},</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #444;">
      Your 7-day free trial ends <strong>tomorrow, ${params.trialEndDate}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #444;">
      After that, your subscription will automatically renew at <strong>${params.billingAmount}</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #444;">
      If you&rsquo;d like to cancel or change your plan, you can do so anytime from your
      <a href="${params.manageUrl}" style="color: #14b8a6; text-decoration: underline;">account settings</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
    <p style="font-size: 14px; line-height: 1.5; color: #888;">
      We hope StutterLab has been helping you build confidence in your speech. If you have any questions, just reply to this email.
    </p>
    <p style="font-size: 14px; color: #888;">— The StutterLab Team</p>
  </div>
</body>
</html>
    `.trim(),
  };
}

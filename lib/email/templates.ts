function wrapper(bodyHtml: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#374151;background:#fff">
  <div style="background:linear-gradient(135deg,#fb923c,#facc15);border-radius:20px;padding:24px;text-align:center;margin-bottom:24px">
    <div style="font-size:40px">🦒</div>
    <div style="color:#fff;font-weight:bold;font-size:18px">Learn with Jina</div>
  </div>
  ${bodyHtml}
  <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center">
    <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe from these emails</a>
  </p>
</body>
</html>`;
}

export function inactivityEmailHtml(firstName: string, unsubscribeUrl: string): string {
  return wrapper(
    `
    <h2 style="color:#1f2937">We miss you, ${firstName}! 👋</h2>
    <p>It's been a few days since your last lesson. Jina the Giraffe is ready whenever you are — even five minutes of practice keeps the streak alive!</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://learn.wambugumartin.com/dashboard" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:16px;text-decoration:none;font-weight:bold;display:inline-block">Continue Learning</a>
    </div>
    `,
    unsubscribeUrl
  );
}

export function digestEmailHtml(
  firstName: string,
  stats: { lessonsCompleted: number; streak: number; totalPoints: number },
  unsubscribeUrl: string
): string {
  return wrapper(
    `
    <h2 style="color:#1f2937">Great week, ${firstName}! 🎉</h2>
    <p>Here's what you accomplished this week:</p>
    <div style="display:flex;gap:12px;margin:20px 0">
      <div style="flex:1;background:#fff7ed;border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:24px;font-weight:bold;color:#f97316">${stats.lessonsCompleted}</div>
        <div style="font-size:12px;color:#78716c">Lessons</div>
      </div>
      <div style="flex:1;background:#fefce8;border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:24px;font-weight:bold;color:#ca8a04">${stats.streak} 🔥</div>
        <div style="font-size:12px;color:#78716c">Day streak</div>
      </div>
      <div style="flex:1;background:#f0fdf4;border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:24px;font-weight:bold;color:#16a34a">${stats.totalPoints} ⭐</div>
        <div style="font-size:12px;color:#78716c">Total points</div>
      </div>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://learn.wambugumartin.com/dashboard" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:16px;text-decoration:none;font-weight:bold;display:inline-block">Keep Going</a>
    </div>
    `,
    unsubscribeUrl
  );
}

export function milestoneEmailHtml(
  firstName: string,
  milestone: { title: string; description: string },
  unsubscribeUrl: string
): string {
  return wrapper(
    `
    <div style="text-align:center;font-size:48px">🏆</div>
    <h2 style="color:#1f2937;text-align:center">${milestone.title}</h2>
    <p style="text-align:center">Amazing work, ${firstName}! ${milestone.description}</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://learn.wambugumartin.com/dashboard" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:16px;text-decoration:none;font-weight:bold;display:inline-block">See Your Progress</a>
    </div>
    `,
    unsubscribeUrl
  );
}

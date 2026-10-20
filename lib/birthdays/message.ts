import { APP_NAME } from "@/lib/config";

export function birthdayMessage(input: {
  firstName: string;
  lastName: string;
  age: number;
  gymName?: string;
}) {
  const gymName = input.gymName ?? APP_NAME;

  return `🎉 Joyeux anniversaire ${input.firstName} !
Toute l'équipe ${gymName} te souhaite une excellente journée et beaucoup de réussite.
Profite pleinement de cette nouvelle année ! 💪`;
}

export function birthdayEmailSubject(firstName: string) {
  return `Joyeux anniversaire ${firstName} !`;
}

export function birthdayMailto(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

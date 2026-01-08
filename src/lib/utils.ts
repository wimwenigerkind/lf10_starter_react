import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {createHash} from "node:crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function gravatarUrl({email, size = 200}: { email: string; size?: number }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = createHash('md5').update(normalizedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
}
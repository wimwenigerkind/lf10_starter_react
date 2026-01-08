import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import { md5 } from "js-md5";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function gravatarUrl({email, size = 200}: { email: string; size?: number }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = md5(normalizedEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
}
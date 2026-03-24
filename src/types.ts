export interface Prospect {
  "Recommended Outreach Order": number;
  "Person": string;
  "Company": string;
  "Sector": string;
  "Confidence Tier": string;
  "Liquidity Signal": string;
  "Designation": string;
  "Notes": string;
  "LinkedIn"?: string;
  "NetWorth"?: string;
  "Reasoning"?: string;
}

export interface Thread {
  id: number;
  title: string;
  description: string;
}

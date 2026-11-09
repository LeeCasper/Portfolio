const SITE_URL = import.meta.env.PUBLIC_SITE_URL || "https://artaides.com";

export const siteConfig = {
	title: "李聪 · 个人作品集",
	author: "李聪",
	url: SITE_URL,
	mail: "",
	resume: "",
	utm: {
		source: `${SITE_URL}`,
		medium: "referral",
		campaign: "navigation",
	},
	meta: {
		title: "李聪 · 软件测试工程师",
		description: "李聪的个人作品集与技术博客。",
		keywords: "李聪, 软件测试工程师, 个人网站, 作品集, 技术博客",
		image: `${SITE_URL}/og.jpg`,
		twitterHandle: "",
	},
};

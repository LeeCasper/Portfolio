const SITE_URL = import.meta.env.PUBLIC_SITE_URL || "https://lichenkang.dev";

export const siteConfig = {
	title: "李陈康 · 个人网站",
	author: "李陈康",
	url: SITE_URL,
	mail: "2188718831@qq.com",
	resume: "",
	utm: {
		source: `${SITE_URL}`,
		medium: "referral",
		campaign: "navigation",
	},
	meta: {
		title: "李陈康 · Java 开发者",
		description: "我是李陈康，景德镇艺术职业大学计算机专业学生，主攻 Java 全栈开发，记录校园项目与学习笔记。",
		keywords: "李陈康, Java 开发, 校园项目, 个人网站, 景德镇艺术职业大学",
		image: `${SITE_URL}/og.jpg`,
		twitterHandle: "",
	},
};

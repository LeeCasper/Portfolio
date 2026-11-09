/** 社交链接（src/collections/social.json） */
export interface SocialItem {
	id: number;
	name: string;
	username: string;
	image: string;
	url: string;
	isShow?: boolean;
}

/** 经历条目（src/collections/experiences.json） */
export interface ExperienceItem {
	dates: string;
	role: string;
	company: string;
	description: string;
	logo: string;
}

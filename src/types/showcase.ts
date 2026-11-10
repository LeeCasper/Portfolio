/** 作品 / 项目卡片共用的数据结构，前台各页把自己的接口数据映射成这个形状 */
export interface ShowcaseItem {
	id: number;
	title: string;
	description?: string | null;
	url: string;
	imageUrl?: string | null;
	videoUrl?: string | null;
	tags?: string[] | null;
	/** ISO 时间字符串，用于卡片上的日期徽标 */
	createdAt?: string | null;
}

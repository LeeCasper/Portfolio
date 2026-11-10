/** 作品 / 项目卡片共用的数据结构，前台各页把自己的接口数据映射成这个形状 */
export interface ShowcaseItem {
	id: number;
	title: string;
	description?: string | null;
	url: string;
	imageUrl?: string | null;
	videoUrl?: string | null;
	/** 小程序码图片，存在时详情页显示「扫码预览」 */
	qrCodeUrl?: string | null;
	tags?: string[] | null;
	/** 详情页逐条展示的亮点 */
	features?: string[] | null;
	/** ISO 时间字符串，用于卡片上的日期徽标 */
	createdAt?: string | null;
	updatedAt?: string | null;
}

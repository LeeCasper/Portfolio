import { runtimeConfig } from "@/lib/runtime-config";

export type BlogPost = {
	id: number;
	title: string;
	slug: string;
	summary?: string;
	content?: string;
	/** 仅在详情接口返回：列表接口为了省去重复渲染会把它置为 null */
	contentHtml?: string | null;
	/** 同上，仅详情接口返回 */
	headings?:
		| {
				slug: string;
				text: string;
				depth: number;
		  }[]
		| null;
	coverImageUrl?: string;
	publishDate: string;
	featured?: boolean;
	published?: boolean;
	tags?: string[];
	createdAt?: string;
	updatedAt?: string;
};

export type Profile = {
	id: number;
	fullName: string;
	headline?: string;
	bio?: string;
	email?: string;
	phone?: string;
	wechat?: string;
	location?: string;
	jobTitle?: string;
	heroImageUrl?: string;
	avatarUrl?: string;
	logoUrl?: string;
	resumeUrl?: string;
	icpNumber?: string;
	icpUrl?: string;
	icpIconUrl?: string;
	policeNumber?: string;
	policeUrl?: string;
	policeIconUrl?: string;
	primaryCtaLabel?: string;
	primaryCtaLink?: string;
	secondaryCtaLabel?: string;
	secondaryCtaLink?: string;
};

export type Work = {
	id: number;
	name: string;
	description?: string;
	url: string;
	imageUrl?: string;
	videoUrl?: string;
	qrCodeUrl?: string;
	tags?: string[];
	features?: string[];
	isShow?: boolean;
	sortOrder?: number;
	createdAt?: string;
	updatedAt?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${runtimeConfig.publicApiBaseUrl}${path}`, {
		cache: "no-store",
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers || {}),
		},
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed: ${response.status}`);
	}

	// 204 或空响应体没有 JSON 可解析，直接返回 null，避免 response.json() 抛语法错误。
	const body = await response.text();
	return body ? (JSON.parse(body) as T) : (null as T);
}

export const apiClient = {
	fetchBlogPosts() {
		return request<BlogPost[]>("/blog-posts");
	},
	fetchBlogPost(slug: string) {
		return request<BlogPost>(`/blog-posts/${slug}`);
	},
	async fetchProfile(): Promise<Profile | null> {
		try {
			return await request<Profile>("/profile");
		} catch {
			// 后端尚未配置个人信息时返回 404，这里按“暂无数据”处理，交由页面走回退展示。
			return null;
		}
	},
	fetchWorks() {
		return request<Work[]>("/works");
	},
};

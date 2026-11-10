/**
 * 技术栈选项：后台「作品管理」从这里选择技术，前端详情页按名称匹配品牌图标。
 * label 会直接写入作品的 tags 字段，改动时注意旧数据兼容。
 */
export interface TechOption {
	label: string;
	/** public/assets/tech 下的图标文件名（不含扩展名）；没有品牌图标时留空 */
	icon?: string;
}

export const TECH_STACK_OPTIONS: TechOption[] = [
	{ label: "Java", icon: "java" },
	{ label: "Spring", icon: "spring" },
	{ label: "Spring Boot", icon: "springboot" },
	{ label: "MyBatis", icon: "mybatis" },
	{ label: "MySQL", icon: "mysql" },
	{ label: "Redis", icon: "redis" },
	{ label: "RabbitMQ", icon: "rabbitmq" },
	{ label: "Kafka", icon: "kafka" },
	{ label: "MongoDB", icon: "mongodb" },
	{ label: "Git", icon: "git" },
	{ label: "Maven", icon: "maven" },
	{ label: "Linux", icon: "linux" },
	{ label: "Docker", icon: "docker" },
	{ label: "Nginx", icon: "nginx" },
	{ label: "Postman", icon: "postman" },
	{ label: "JMeter", icon: "jmeter" },
	{ label: "Selenium", icon: "selenium" },
	{ label: "JUnit", icon: "junit" },
	{ label: "Playwright", icon: "playwright" },
	{ label: "Pytest", icon: "pytest" },
	{ label: "Python", icon: "python" },
	{ label: "Vue3", icon: "vue" },
	{ label: "Vue", icon: "vue" },
	{ label: "React", icon: "react" },
	{ label: "Next.js", icon: "nextjs" },
	{ label: "Node.js", icon: "nodejs" },
	{ label: "TypeScript", icon: "typescript" },
	{ label: "JavaScript", icon: "javascript" },
	{ label: "uni-app", icon: "uniapp" },
	{ label: "微信小程序", icon: "wechat" },
	{ label: "HTML", icon: "html" },
	{ label: "CSS", icon: "css" },
	{ label: "Tailwind CSS", icon: "tailwind" },
	{ label: "Bootstrap", icon: "bootstrap" },
	{ label: "Go", icon: "go" },
	{ label: "Rust", icon: "rust" }
];

/** 常见写法/别名，统一映射到图标文件 */
const TECH_ALIASES: Record<string, string> = {
	"vue.js": "vue",
	"vue 3": "vue",
	"vuejs": "vue",
	"springboot": "springboot",
	"spring boot 3": "springboot",
	"node": "nodejs",
	"next": "nextjs",
	js: "javascript",
	ts: "typescript",
	"junit5": "junit",
	"apache jmeter": "jmeter",
	"tailwindcss": "tailwind",
	"html5": "html",
	"css3": "css"
};

const TECH_ICON_BY_LABEL = new Map(
	TECH_STACK_OPTIONS.map((option) => [option.label.toLowerCase(), option.icon])
);

/** 根据标签名取品牌图标地址；没有对应图标时返回 null，交给调用方用通用图标兜底 */
export function getTechIcon(tag: string): string | null {
	const key = tag.trim().toLowerCase();
	const icon = TECH_ICON_BY_LABEL.get(key) ?? TECH_ALIASES[key];

	return icon ? `/assets/tech/${icon}.svg` : null;
}

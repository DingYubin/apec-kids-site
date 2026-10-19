/* ================================================================
   《小鹏友的APEC朋友圈》内容数据
   所有文案和图片路径集中在这个文件里，改文案只改这里。
   文案来源：docs/01-内容大纲与文案.md
   ================================================================ */

/* 图片扩展名：你生成的是 png / jpg，就把下面改成 "png" 或 "jpg" */
const ASSET_EXT = "webp";
const asset = (...parts) => `assets/${parts.join("/")}.${ASSET_EXT}`;

/* 页脚署名（插画工具名做好后填上） */
const CREDITS = {
  research: "腾讯元宝",
  code: "腾讯 CodeBuddy",
  art: "【插画工具名待填】",
};

/* ---------- 21个经济体卡片 ---------- */
const ECONOMIES = [
  { id: 1,  slug: "china",       name: "中国",           emoji: "🐼", hue: 12,  text: "你好！我家有大熊猫、长城和饺子——你最喜欢哪一个？" },
  { id: 2,  slug: "hongkong",    name: "中国香港",       emoji: "🚢", hue: 202, text: "早晨！我住在维多利亚港旁边。坐一次天星小轮，再配一个蛋挞，完美！" },
  { id: 3,  slug: "taipei",      name: "中国台北",       emoji: "🧋", hue: 330, text: "哈啰！下课来一杯珍珠奶茶吗？我请客，珍珠QQ的！" },
  { id: 4,  slug: "japan",       name: "日本",           emoji: "🗻", hue: 340, text: "こんにちは（空尼其哇）！我家有富士山，奈良的小鹿会鞠躬讨饼干吃。" },
  { id: 5,  slug: "korea",       name: "韩国",           emoji: "🏯", hue: 285, text: "안녕하세요（安宁哈塞哟）！泡菜配拌饭是我的最爱，景福宫的屋檐像大鸟展开翅膀。" },
  { id: 6,  slug: "australia",   name: "澳大利亚",       emoji: "🦘", hue: 36,  text: "G'day（格戴）！我家的袋鼠爱跳高，考拉一天要睡20个小时。" },
  { id: 7,  slug: "newzealand",  name: "新西兰",         emoji: "🥝", hue: 152, text: "Kia ora（基奥拉）！奇异鸟不会飞，奇异果很香甜，夜空里全是星星。" },
  { id: 8,  slug: "indonesia",   name: "印度尼西亚",     emoji: "🦎", hue: 178, text: "Halo（哈啰）！我家有一万七千多个岛，还有世界上最大的蜥蜴——科莫多巨蜥。" },
  { id: 9,  slug: "malaysia",    name: "马来西亚",       emoji: "🍚", hue: 26,  text: "Apa khabar（阿帕卡巴）！早餐一包椰浆饭，晚上逛夜市喝拉茶。" },
  { id: 10, slug: "philippines", name: "菲律宾",         emoji: "🐒", hue: 122, text: "Kumusta（库姆斯塔）！我家有一万多个海岛，丛林里住着大眼睛的眼镜猴。" },
  { id: 11, slug: "singapore",   name: "新加坡",         emoji: "🦁", hue: 232, text: "Hello！我的城市有会喷水的鱼尾狮，还有像森林一样的滨海湾花园。" },
  { id: 12, slug: "thailand",    name: "泰国",           emoji: "🐘", hue: 46,  text: "สวัสดี（萨瓦迪）！我家的大象很温柔，芒果糯米饭甜甜的。" },
  { id: 13, slug: "vietnam",     name: "越南",           emoji: "🍜", hue: 132, text: "Xin chào（新早）！河粉热腾腾，下龙湾的山像从海里长出来的。" },
  { id: 14, slug: "brunei",      name: "文莱",           emoji: "🛶", hue: 192, text: "Salam（萨拉姆）！我们住在水上村庄，出门坐小船，去吃沙爹串。" },
  { id: 15, slug: "png",         name: "巴布亚新几内亚", emoji: "🦜", hue: 92,  text: "Halo（哈啰）！我家有会跳舞的天堂鸟，羽毛像彩虹。" },
  { id: 16, slug: "mexico",      name: "墨西哥",         emoji: "🌮", hue: 20,  text: "¡Hola（欧拉）！玉米是我家的好朋友，塔可香香的，金字塔是古人盖的。" },
  { id: 17, slug: "peru",        name: "秘鲁",           emoji: "🦙", hue: 262, text: "¡Hola（欧拉）！羊驼穿着厚厚的“毛衣”，马丘比丘藏在云里面。" },
  { id: 18, slug: "chile",       name: "智利",           emoji: "🍒", hue: 355, text: "¡Hola（欧拉）！我家的车厘子又大又甜，复活节岛的石像面朝大海。" },
  { id: 19, slug: "russia",      name: "俄罗斯",         emoji: "🪆", hue: 220, text: "Привет（普里维特）！套娃一层套一层，布林饼配果酱，冬天的雪花像鹅毛。" },
  { id: 20, slug: "canada",      name: "加拿大",         emoji: "🍁", hue: 16,  text: "Hello! Bonjour! 枫糖浆淋在松饼上，河狸会用树枝盖“小水坝”。" },
  { id: 21, slug: "usa",         name: "美国",           emoji: "🌉", hue: 206, text: "Hello！黄石公园里有会准时喷水的“老忠实”泉，金门大桥是红色的，很酷吧！" },
].map(e => ({ ...e, img: asset("cards", `card-${String(e.id).padStart(2, "0")}-${e.slug}`) }));

/* ---------- 栏目②：朋友圈里的一天 ---------- */
const MOMENTS = [
  {
    id: "kevin",
    name: "凯文",
    place: "深圳 · 南山",
    time: "今天 · 早上",
    avatar: asset("avatars", "avatar-kevin"),
    emoji: "🙋‍♂️",
    text: `早上一碗热汤面🍜
上学的路上，簕杜鹃开了一路🌸
——妈妈告诉我，这是深圳的市花。
中午在学校午休，放学在操场跑了几圈🏃
睡前读完一个小故事，再睡💤
你们的一天，是什么样的？`,
    images: [
      { src: asset("moments", "moment-kevin-1"), emoji: "🍜", alt: "凯文的早餐面" },
      { src: asset("moments", "moment-kevin-2"), emoji: "🌸", alt: "上学路上的簕杜鹃" },
      { src: asset("moments", "moment-kevin-3"), emoji: "🏃", alt: "放学后的操场" },
    ],
    likes: 28,
    comments: [
      { who: "鹏小友", text: "簕杜鹃（也叫三角梅）是深圳的市花，秋天开得最热闹！🌺" },
      { who: "小葵",   text: "面条看起来好好吃！我们学校的乌冬面是凉凉的～" },
      { who: "凯文 回复 小葵", text: "那下次你教我做乌冬面，我教你用筷子！🥢" },
    ],
  },
  {
    id: "xiaokui",
    name: "小葵",
    place: "日本 · 东京",
    time: "今天 · 中午",
    avatar: asset("avatars", "avatar-xiaokui"),
    emoji: "🙋‍♀️",
    text: `今天是“给食当番”！
戴上白帽子，给全班同学分咖喱饭，
手有一点点抖，但大家都说谢谢😌
放学我要去道场练一会儿剑道——
“面！”（这一声，喊的是勇气）`,
    images: [{ src: asset("moments", "moment-xiaokui"), emoji: "🍛", alt: "小葵在分咖喱饭" }],
    likes: 31,
    comments: [
      { who: "阿米尔", text: "看起来好香！下次视频教我做～" },
      { who: "凯文",   text: "进门要换白色室内鞋对不对？我在书里看到过！" },
      { who: "小葵 回复 凯文", text: "对！你懂我！👟" },
    ],
  },
  {
    id: "amir",
    name: "阿米尔",
    place: "马来西亚 · 吉隆坡",
    time: "今天 · 晚上",
    avatar: asset("avatars", "avatar-amir"),
    emoji: "🙋‍♂️",
    text: `早上妈妈买了我最爱的椰浆饭🍚
放学先去课外活动，
晚上全家一起逛夜市！
拉茶师傅把奶茶“拉”成长长的一条，
像变魔术一样🎪`,
    images: [{ src: asset("moments", "moment-amir"), emoji: "🍵", alt: "夜市的拉茶" }],
    likes: 26,
    comments: [
      { who: "露娜", text: "拉茶是什么味道的？" },
      { who: "阿米尔 回复 露娜", text: "甜甜的，有好多泡泡，超好喝！" },
      { who: "凯文", text: "夜市里有没有卖烤串？🤤" },
    ],
  },
  {
    id: "luna",
    name: "露娜",
    place: "秘鲁 · 利马",
    time: "昨天 18:32",
    avatar: asset("avatars", "avatar-luna"),
    emoji: "🙋‍♀️",
    badge: "🌍 和我这里差13个小时",
    text: `晚饭前帮妈妈摆了桌子。
上个月，我真的摸到羊驼了！
它的“毛衣”软软的、暖暖的🦙
哦对了——你们看到这条的时候，
我这边可能还在“昨天”呢🌍`,
    images: [{ src: asset("moments", "moment-luna"), emoji: "🦙", alt: "露娜摸羊驼" }],
    likes: 24,
    comments: [
      { who: "凯文", text: "等一下——你们那边还是昨天晚上？！地球是圆的也太酷了！" },
      { who: "露娜 回复 凯文", text: "对呀，所以我先说“明天见”！👋" },
      { who: "鹏小友", text: "小知识：深圳和利马大约相差13个小时哦。" },
    ],
  },
];

/* ---------- 栏目③：南山五张卡 ---------- */
const NANSHAN = [
  { id: 1, title: "深圳湾 · 人才公园", tag: "开放的海湾", emoji: "🚲", img: asset("nanshan", "nanshan-1-shenzhenbay"),
    lines: ["周末我沿着深圳湾骑车，海风咸咸的。", "海的那一边就是香港——", "原来“开放”两个字，离我只有一湾水的距离。"] },
  { id: 2, title: "南头古城", tag: "历史的老家", emoji: "🏮", img: asset("nanshan", "nanshan-2-nantou"),
    lines: ["南头古城快1700岁了，", "是深圳和香港共同的“老家”。", "石板路一走，就像钻进一台时光机。"] },
  { id: 3, title: "南山科技园", tag: "科技的客厅", emoji: "💡", img: asset("nanshan", "nanshan-3-sciencepark"),
    lines: ["“中国硅谷”就在我家门口，", "腾讯、大疆都是从深圳出发的。", "爸爸说：科技的终点不是机器，是让生活更方便，让朋友更近。"] },
  { id: 4, title: "蛇口 · 海上世界 & K11 ECOAST", tag: "敢闯的起点", emoji: "⛵", img: asset("nanshan", "nanshan-4-shekou"),
    lines: ["1979年，蛇口的“开山第一炮”就是在这里响的。", "那句“时间就是金钱，效率就是生命”，说得好带劲！", "现在这里有大海、有艺术、有K11——老故事和新潮流，是邻居。"] },
  { id: 5, title: "前海", tag: "未来的窗口", emoji: "🔭", img: asset("nanshan", "nanshan-5-qianhai"),
    lines: ["前海的高楼一天天长高，是深圳的“未来之城”。", "也许有一天，", "亚太的同学们会来这里工作、生活、交朋友。"] },
];

const TIMELINE = [
  { year: "1980", text: "特区成立" },
  { year: "1984", text: "三天一层楼" },
  { year: "1998 / 2006", text: "腾讯 · 大疆出发" },
  { year: "2026", text: "APEC来深圳" },
];

/* ---------- 测验题（backup:true 的是备用题） ---------- */
const QUIZ = [
  { q: "2026年APEC峰会在哪座城市举办？", options: ["北京", "上海", "深圳", "广州"], answer: 2,
    tip: "APEC第三次来到中国：2001年上海、2014年北京、2026年深圳。" },
  { q: "APEC这个“大家庭”有多少个成员经济体？", options: ["10个", "21个", "50个"], answer: 1,
    tip: "从中国到秘鲁，一共21个成员经济体。" },
  { q: "深圳市的市花是什么花？", options: ["簕杜鹃（三角梅）", "荷花", "樱花"], answer: 0,
    tip: "凯文上学路上看到的就是它，秋天开得最热闹。" },
  { q: "“三天一层楼”的“深圳速度”说的是哪座楼？", options: ["国贸大厦", "腾讯大厦", "双子塔"], answer: 0,
    tip: "1984年，国贸大厦创造了“三天一层楼”的纪录。" },
  { q: "在秘鲁，穿着厚厚“毛衣”的动物是谁？", options: ["考拉", "羊驼", "大熊猫"], answer: 1,
    tip: "羊驼的毛能织成暖暖的毛衣。" },
  { q: "日语里的“你好”怎么说？", options: ["こんにちは", "Xin chào", "Salam"], answer: 0,
    tip: "读作“空尼其哇”。" },
  { q: "马来西亚的招牌早餐是什么？", options: ["椰浆饭", "寿司", "塔可"], answer: 0,
    tip: "椰浆饭是阿米尔的最爱。" },
  { q: "下面哪个“不是”APEC的关键词？", options: ["开放", "合作", "独来独往", "互联互通"], answer: 2,
    tip: "APEC讲的是大家一起合作、互联互通。" },
  { q: "深圳为什么叫“鹏城”？", options: ["因为有大鹏所城", "因为风筝多", "因为海滩大"], answer: 0,
    tip: "600多年的大鹏所城，是深圳的根。", backup: true },
  { q: "深圳和秘鲁利马的时差大约是几小时？", options: ["1小时", "13小时", "24小时"], answer: 1,
    tip: "所以露娜现在还“活在昨天”。", backup: true },
];

/* ---------- 留言墙：初始示例 ---------- */
const NOTE_SEED = [
  { name: "凯文", text: "欢迎来深圳！我带你去深圳湾骑自行车！" },
  { name: "凯文", text: "我们的城市有大海也有高楼，希望你会喜欢！" },
];

/* ---------- 鹏小友的小提示（点击右下角小鸟随机出现） ---------- */
const PENGYOU_TIPS = [
  "你知道吗？深圳的别名叫“鹏城”，600多年前就有大鹏所城啦！",
  "簕杜鹃是深圳的市花，秋天开花最热闹，粉粉紫紫的！",
  "2026年APEC要在深圳开，这是APEC第三次来到中国。",
  "深圳和秘鲁利马相差大约13个小时，我打“明天见”的时候，利马还在昨天晚上哦。",
  "点一下班级墙的卡片，能翻到背面，学一句问候语！",
  "腾讯和大疆都是从深圳出发的，就在南山科技园那一带。",
  "在深圳湾骑车，海的对岸就是香港，这就是“开放”的距离。",
  "我把21个经济体做成了21盏小灯，翻到最后点亮它们吧！",
];

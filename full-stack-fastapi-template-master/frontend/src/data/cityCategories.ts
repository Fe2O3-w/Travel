export interface CityCategory {
  cid: number
  name: string
  province: string
  emoji: string
}

export const CITY_CATEGORIES: CityCategory[] = [
  { cid: 290, name: "北京",   province: "北京市",           emoji: "🏯" },
  { cid: 291, name: "天津",   province: "天津市",           emoji: "🎭" },
  { cid: 292, name: "上海",   province: "上海市",           emoji: "🌆" },
  { cid: 293, name: "重庆",   province: "重庆市",           emoji: "🌶️" },
  { cid: 294, name: "河北",   province: "河北省",           emoji: "🏔️" },
  { cid: 295, name: "山西",   province: "山西省",           emoji: "🏛️" },
  { cid: 296, name: "辽宁",   province: "辽宁省",           emoji: "🏭" },
  { cid: 297, name: "吉林",   province: "吉林省",           emoji: "❄️" },
  { cid: 298, name: "黑龙江", province: "黑龙江省",         emoji: "☃️" },
  { cid: 299, name: "江苏",   province: "江苏省",           emoji: "🦆" },
  { cid: 300, name: "浙江",   province: "浙江省",           emoji: "⛵" },
  { cid: 301, name: "安徽",   province: "安徽省",           emoji: "🌲" },
  { cid: 302, name: "福建",   province: "福建省",           emoji: "🍵" },
  { cid: 303, name: "江西",   province: "江西省",           emoji: "🏮" },
  { cid: 304, name: "山东",   province: "山东省",           emoji: "⛰️" },
  { cid: 305, name: "河南",   province: "河南省",           emoji: "🏺" },
  { cid: 306, name: "湖北",   province: "湖北省",           emoji: "🌸" },
  { cid: 307, name: "湖南",   province: "湖南省",           emoji: "🍢" },
  { cid: 308, name: "广东",   province: "广东省",           emoji: "🍵" },
  { cid: 309, name: "广西",   province: "广西壮族自治区",   emoji: "🌿" },
  { cid: 310, name: "海南",   province: "海南省",           emoji: "🏖️" },
  { cid: 311, name: "四川",   province: "四川省",           emoji: "🐼" },
  { cid: 312, name: "贵州",   province: "贵州省",           emoji: "🌊" },
  { cid: 313, name: "云南",   province: "云南省",           emoji: "🌺" },
  { cid: 314, name: "西藏",   province: "西藏自治区",       emoji: "🏔️" },
  { cid: 315, name: "陕西",   province: "陕西省",           emoji: "🏺" },
  { cid: 316, name: "甘肃",   province: "甘肃省",           emoji: "🍜" },
  { cid: 317, name: "青海",   province: "青海省",           emoji: "🦅" },
  { cid: 318, name: "宁夏",   province: "宁夏回族自治区",   emoji: "🌙" },
  { cid: 319, name: "新疆",   province: "新疆维吾尔自治区", emoji: "🐫" },
  { cid: 320, name: "内蒙古", province: "内蒙古自治区",     emoji: "🐎" },
  { cid: 321, name: "香港",   province: "香港特别行政区",   emoji: "🌃" },
  { cid: 322, name: "澳门",   province: "澳门特别行政区",   emoji: "🎰" },
  { cid: 323, name: "台湾",   province: "台湾省",           emoji: "🧋" },
]

export const getCityByName = (name: string) =>
  CITY_CATEGORIES.find(c => c.name === name)
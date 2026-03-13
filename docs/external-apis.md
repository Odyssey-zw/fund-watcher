### 数据层外部接口依赖文档（`backend/data/*_api.go`）

本文档列出 `backend/data` 目录下所有 `*_api.go` 文件中，**显式写死的外部 HTTP 接口**，按文件与第三方服务分组，便于做网络白名单、代理配置或后续重构。

> 说明：诸如 OpenAI / DeepSeek / AnythingLLM / Ollama / 钉钉机器人等接口，均通过配置中的 `BaseUrl` / Webhook 动态拼接，在代码中没有固定 URL 字符串，因此不在本清单内。

---

## 一、`stock_data_api.go` – 股票数据相关

### 1.1 Tushare

- **Base URL**
  - `http://api.tushare.pro`（常量 `tushareApiUrl`）

- **调用**
  - `StockDataApi.GetIndexBasic`
    - `POST http://api.tushare.pro`
    - `api_name=index_basic`，获取指数基础信息
  - `StockDataApi.GetStockBaseInfo`
    - `POST http://api.tushare.pro`
    - `api_name=stock_basic`，获取 A 股基础信息

（`TushareApi.GetDaily` 在 `tushare_data_api.go`，见第四节）

---

### 1.2 新浪行情 / 基金 / 资金

- **实时行情（多市场）**
  - 模板常量：`http://hq.sinajs.cn/rn=%d&list=%s`
  - 使用函数：`StockDataApi.GetStockCodeRealTimeData`

- **个股 K 线**
  - `http://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData?symbol=%s&scale=%s&ma=yes&datalen=%d`
  - 使用函数：`StockDataApi.GetKLineData`

- **基金净值（在 `fund_data_api.go`，见第二节）**
  - 模板：`http://hq.sinajs.cn/rn=%d&list=f_%s`

---

### 1.3 腾讯行情 / 分时 / K 线 / 港股列表

- **实时行情（A 股 / 港股）**
  - 模板常量：`http://qt.gtimg.cn/?_=%d&q=%s`
  - 使用函数：`StockDataApi.GetStockCodeRealTimeData`

- **分时数据**
  - A 股/港股：`https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=%s`
  - 美股：`https://web.ifzq.gtimg.cn/appstock/app/UsMinute/query?code=%s`
  - 使用函数：`StockDataApi.GetStockMinutePriceData`

- **港股 / 通用 K 线**
  - `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=%s,%s,,,%d,qfq`
  - 使用函数：`StockDataApi.GetHK_KLineData`、`StockDataApi.GetCommonKLineData`

- **港股列表 / 排行**
  - `https://stock.gtimg.cn/data/hk_rank.php?board=main_all&metric=price&pageSize=%d&reqPage=1&order=desc&var_name=list_data`
  - `https://stock.gtimg.cn/data/hk_rank.php?board=main_all&metric=price&pageSize=%d&reqPage=%d&order=desc&var_name=list_data`
  - 使用函数：`StockDataApi.GetHKStockInfo`

---

### 1.4 东方财富 – 行情 & 资金 & 选股 & F10

- **东财 DC 行情（全市场列表）**
  - `https://push2.eastmoney.com/api/qt/clist/get?...`
  - 使用函数：`StockDataApi.getDCStockInfo`、`StockDataApi.GetStockMoneyData`

- **东财历史资金流**
  - `https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?cb=data&...&secid=...`
  - 使用函数：`StockDataApi.GetStockHistoryMoneyData`

- **东财选股接口（全市场选股列表）**
  - `https://data.eastmoney.com/dataapi/xuangu/list?...`
  - 使用函数：`StockDataApi.GetAllStocks`

- **东财 F10 – 概念&题材**
  - `https://datacenter.eastmoney.com/securities/api/data/v1/get?reportName=RPT_F10_CORETHEME_BOARDTYPE&...`
  - 使用函数：`StockDataApi.GetStockConceptInfo`

- **东财 F10 – 财务分析（杜邦等）**
  - `https://datacenter.eastmoney.com/securities/api/data/v1/get?reportName=RPT_F10_FINANCE_DUPONT&...`
  - 使用函数：`StockDataApi.GetStockFinancialInfo`

- **东财 F10 – 股东户数**
  - `https://datacenter.eastmoney.com/securities/api/data/v1/get?reportName=RPT_F10_EH_HOLDERNUM&...`
  - 使用函数：`StockDataApi.GetStockHolderNum`

---

### 1.5 新浪 / 东财个股页面 & 资讯搜索

- **新浪个股/指数详情页**
  - `https://finance.sina.com.cn/realstock/company/%s/nc.shtml`
    - 使用函数：`GetZSInfo`、`getSHSZStockPriceInfo`

- **新浪美股详情**
  - `https://stock.finance.sina.com.cn/usstock/quotes/%s.html`
  - 使用函数：`getUSStockPriceInfo`

- **新浪港股详情**
  - `https://stock.finance.sina.com.cn/hkstock/quotes/%s.html`
  - 使用函数：`getHKStockPriceInfo`

- **东财个股详情页**
  - `https://quote.eastmoney.com/%s.html`
  - 使用函数：`GetRealTimeStockPriceInfo`

- **财联社搜索页**
  - `https://www.cls.cn/searchPage?keyword=%s&type=%s`
  - 使用函数：`SearchStockInfo`

- **百度股市通个股页**
  - `https://gushitong.baidu.com/stock/ab-%s`
  - 使用函数：`SearchStockInfoByCode`

---

## 二、`fund_data_api.go` – 基金数据相关

### 2.1 天天基金

- **基金详情页（基本信息）**
  - Base：`http://fund.eastmoney.com`（作为 `CrawlerBaseInfo.BaseUrl`）
  - 实际 URL：`http://fund.eastmoney.com/%s.html`
  - 使用函数：`FundApi.CrawlFundBasic`

- **全部基金列表**
  - `https://fund.eastmoney.com/allfund.html`
  - 使用函数：`FundApi.AllFund`

- **净值估算**
  - `https://fundgz.1234567.com.cn/js/%s.js`
  - 使用函数：`FundApi.CrawlFundNetEstimatedUnit`

### 2.2 新浪基金

- **基金实时净值**
  - `http://hq.sinajs.cn/rn=%d&list=f_%s`
  - 使用函数：`FundApi.CrawlFundNetUnitValue`

---

## 三、`market_news_api.go` – 市场新闻、研报、宏观数据

### 3.1 财联社（CLS）

- **电报 JSON 接口**
  - `https://www.cls.cn/nodeapi/telegraphList`
  - 使用函数：`TelegraphList`

- **电报 HTML 页**
  - `https://www.cls.cn/telegraph`
  - 使用函数：`GetNewTelegraph`

- **财经日历**
  - `https://www.cls.cn/api/calendar/web/list?app=CailianpressWeb&flag=0&os=web&sv=8.4.6&type=0&sign=...`
  - 使用函数：`ClsCalendar`

- **站内搜索（用于 AI 资讯）**
  - `https://www.cls.cn/api/csw?app=CailianpressWeb&os=web&sv=8.4.6&sign=...`
  - 使用函数：`CailianpressWeb`

---

### 3.2 新浪财经

- **直播电报流**
  - `https://zhibo.sina.com.cn/api/zhibo/feed?callback=callback&page=1&page_size=20&zhibo_id=152&...`
  - 使用函数：`GetSinaNews`

- **行业资金流排行**
  - `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_bkzj_bk?...`
  - 使用函数：`GetIndustryMoneyRankSina`

- **个股资金流排行**
  - `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_bkzj_ssggzj?...`
  - 使用函数：`GetMoneyRankSina`

- **个股资金流趋势（日度）**
  - `http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_qsfx_zjlrqs?...`
  - 使用函数：`GetStockMoneyTrendByDay`

- **龙虎榜页面（HTML）**
  - `http://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/lhb/index.phtml?tradedate=%s`
  - 使用函数：`TopStocksRankingList`

---

### 3.3 腾讯 & 东方财富 – 指数 / 资金 / 龙虎榜 / 宏观

- **腾讯 – 全球指数**
  - `https://proxy.finance.qq.com/ifzqgtimg/appstock/app/rank/indexRankDetail2`
  - 使用函数：`GlobalStockIndexes`

- **腾讯 – 行业涨跌排行**
  - `https://proxy.finance.qq.com/ifzqgtimg/app/mktHs/rank?l=%d&p=1&t=01/averatio&ordertype=&o=%s`
  - 使用函数：`GetIndustryRank`

- **东财 – 龙虎榜明细**
  - `https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPT_DAILYBILLBOARD_DETAILSNEW&...`
  - 使用函数：`LongTiger`

- **东财 – 行业研报列表**
  - `https://reportapi.eastmoney.com/report/list`
  - 使用函数：`IndustryResearchReport`

- **东财 – 个股研报列表**
  - `https://reportapi.eastmoney.com/report/list2`
  - 使用函数：`StockResearchReport`

- **东财 – 公司公告**
  - `https://np-anotice-stock.eastmoney.com/api/security/ann?page_size=50&page_index=1&ann_type=SHA%2CCYB%2CSZA%2CBJA%2CINV&client_source=web&f_node=0&stock_list=...`
  - 使用函数：`StockNotice`

- **东财 – 板块字典（行业编码）**
  - `https://reportapi.eastmoney.com/report/bk?bkCode=...`
  - 使用函数：`EMDictCode`

- **东财 – 宏观数据**
  - GDP：`https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&...&reportName=RPT_ECONOMY_GDP...` → `GetGDP`
  - CPI：`https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&...&reportName=RPT_ECONOMY_CPI...` → `GetCPI`
  - PPI：`https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&...&reportName=RPT_ECONOMY_PPI...` → `GetPPI`
  - PMI：`https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&...&reportName=RPT_ECONOMY_PMI...` → `GetPMI`

- **东财 – 行业研报详情（HTML → Markdown）**
  - `https://data.eastmoney.com/report/zw_industry.jshtml?infocode=%s`
  - 使用函数：`GetIndustryReportInfo`

- **东财 – 券商观点列表**
  - `https://reportapi.eastmoney.com/report/jg?cb=data&pageSize=50&beginTime=%s&endTime=%s&pageNo=1&fields=&qType=4&orgCode=&author=&p=1&pageNum=1&pageNumber=1&_=%d`
  - 使用函数：`GetSecuritiesCompanyOpinion`

- **东财 – 券商观点详情**
  - `https://data.eastmoney.com/report/zw_brokerreport.jshtml?encodeUrl=%s`
  - 使用函数：`GetSecuritiesCompanyOpinionContent`

---

### 3.4 TradingView

- **新闻列表（简体中文）**
  - `https://news-mediator.tradingview.com/news-flow/v2/news?filter=lang%3Azh-Hans&client=screener&streaming=false`
  - 使用函数：`TradingViewNews`

- **新闻详情**
  - `https://news-headlines.tradingview.com/v3/story?id=%s&lang=zh-Hans`
  - 使用函数：`TradingViewNewsDetail`

- **前端展示链接**
  - `https://cn.tradingview.com/news/%s`（仅拼在 `Telegraph.Url`，不直接发请求）

---

### 3.5 雪球（Xueqiu）

- **热门股票列表（需先访问主页获取 Cookie）**
  - 主页：`https://xueqiu.com/hq#hot`
  - API：`https://stock.xueqiu.com/v5/stock/hot_stock/list.json?page=1&size=%d&_type=%s&type=%s`
  - 使用函数：`XUEQIUHotStock`

- **热门事件**
  - `https://xueqiu.com/hot_event/list.json?count=%d`
  - 使用函数：`HotEvent`

---

### 3.6 其他来源

- **东方财富股吧热门话题**
  - `https://gubatopic.eastmoney.com/interface/GetData.aspx?path=newtopic/api/Topic/HomePageListRead`
  - 使用函数：`HotTopic`

- **玖阳公社 – 投资日历**
  - `https://app.jiuyangongshe.com/jystock-app/api/v1/timeline/list`
  - 使用函数：`InvestCalendar`

- **路透社新闻**
  - `https://www.reuters.com/pf/api/v3/content/fetch/recent-stories-by-sections-v1?...`
  - 使用函数：`ReutersNew`

- **巨潮资讯 – 互动问答**
  - `https://irm.cninfo.com.cn/newircs/index/search?_t=%d`
  - 使用函数：`InteractiveAnswer`

---

## 四、`tushare_data_api.go` – Tushare 日线行情

- **Base URL**
  - `http://api.tushare.pro`（与 `stock_data_api.go` 中 `tushareApiUrl` 相同）

- **调用**
  - `TushareApi.GetDaily`
    - `POST http://api.tushare.pro`
    - `api_name` 根据代码自动选择：`daily`（A 股）、`hk_daily`（港股）、`us_daily`（美股）

---

## 五、`search_stock_api.go` – 东财智能选股 & 同花顺策略

- **东财智能选股 – 股票搜索**
  - `https://np-tjxg-g.eastmoney.com/api/smart-tag/stock/v3/pw/search-code`
  - 使用函数：`SearchStockApi.SearchStock`

- **东财智能选股 – 板块搜索**
  - `https://np-tjxg-b.eastmoney.com/api/smart-tag/bkc/v3/pw/search-code`
  - 使用函数：`SearchBk`

- **东财智能选股 – ETF 搜索**
  - `https://np-tjxg-b.eastmoney.com/api/smart-tag/etf/v3/pw/search-code`
  - 使用函数：`SearchETF`

- **东财 iPick – 热门选股策略**
  - `https://np-ipick.eastmoney.com/recommend/stock/heat/ranking?count=20&trace=%d&client=web&biz=web_smart_tag`
  - 使用函数：`HotStrategy` / `HotStrategyTable`

- **同花顺 – 策略广场热门策略**
  - `https://backtest.10jqka.com.cn/strategysquare/list?order=desc&page=1&pageNum=10&sortType=hot&keyword=`
  - 使用函数：`StrategySquare`

---

## 六、说明

- 本文档仅包含 **代码中硬编码的 URL/域名**。
- 动态配置生成的接口（如 OpenAI / DeepSeek / AnythingLLM / Ollama / 钉钉机器人 Webhook 等）未列出，但仍属于外部依赖。
- 如需将这些域名抽取为 **域名白名单 / 网关配置**，可以在此文档基础上按域名进行再归类。

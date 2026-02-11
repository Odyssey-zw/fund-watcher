import type { FundPosition, FundSearchResult } from "~/types/fund";
import { Button, Cell, Form, Input } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import { getHotFunds } from "~/api/fund";
import { addPosition, updatePosition } from "~/api/position";
import PageWrapper from "~/components/page-wrapper";
import { useFundStore, usePositionStore } from "~/store";
import { formatFundValue, isValidFundCode } from "~/utils/fundUtils";

interface FundInfo {
  code: string;
  name: string;
  currentValue: number;
}

export default function AddPosition() {
  const router = useRouter();
  const { fundCode: initialFundCode, mode } = router.params;
  const isEditMode = mode === "edit";
  const positionStore = usePositionStore();
  const fundStore = useFundStore();

  const [fundCode, setFundCode] = useState(initialFundCode || "");
  const [fundInfo, setFundInfo] = useState<FundInfo | null>(null);
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hotFundsList, setHotFundsList] = useState<FundSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<FundSearchResult[]>([]);

  const searchFundInfo = async (code: string) => {
    if (!isValidFundCode(code)) {
      setFundInfo(null);
      return;
    }

    try {
      setSearching(true);
      // 从全局缓存获取基金数据
      const realTimeData = await fundStore.getFundRealTimeData(code);

      if (realTimeData && realTimeData.name) {
        setFundInfo({
          code,
          name: realTimeData.name,
          currentValue: realTimeData.currentValue,
        });
      } else {
        setFundInfo(null);
        Taro.showToast({
          title: "基金代码不存在",
          icon: "none",
        });
      }
    } catch (error) {
      console.error("搜索基金失败:", error);
      setFundInfo(null);
      Taro.showToast({
        title: "搜索失败",
        icon: "none",
      });
    } finally {
      setSearching(false);
    }
  };

  const loadExistingPosition = async () => {
    try {
      // 从 store 获取持仓数据,如果没有则从 API 加载
      if (positionStore.positions.length === 0) {
        await positionStore.loadPositions();
      }
      const position = positionStore.getPosition(initialFundCode || "");
      if (position) {
        setFundCode(position.fundCode);
        setShares(position.shares.toString());
        setCost(position.cost.toString());
        setBuyDate(position.buyDate);
        // 搜索基金信息
        searchFundInfo(position.fundCode);
      }
    } catch (error) {
      console.error("加载持仓数据失败:", error);
    }
  };

  const handleFundCodeChange = (value: string) => {
    setFundCode(value);

    // 过滤匹配的基金
    if (value && value.length > 0) {
      const filtered = hotFundsList.filter(
        fund => fund.code.includes(value) || fund.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && value.length < 6);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }

    if (value.length === 6) {
      searchFundInfo(value);
      setShowSuggestions(false);
    } else {
      setFundInfo(null);
    }
  };

  const handleSuggestionClick = (fund: FundSearchResult) => {
    setFundCode(fund.code);
    setShowSuggestions(false);
    searchFundInfo(fund.code);
  };

  const handleSharesChange = (value: string) => {
    setShares(value);
  };

  const handleCostChange = (value: string) => {
    setCost(value);
  };

  const handleBuyDateChange = (value: string) => {
    setBuyDate(value);
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!fundInfo) {
      Taro.showToast({
        title: "请输入有效的基金代码",
        icon: "none",
      });
      return;
    }

    if (!shares || Number.parseFloat(shares) <= 0) {
      Taro.showToast({
        title: "请输入有效的持有份额",
        icon: "none",
      });
      return;
    }

    if (!cost || Number.parseFloat(cost) <= 0) {
      Taro.showToast({
        title: "请输入有效的成本金额",
        icon: "none",
      });
      return;
    }

    if (!buyDate) {
      Taro.showToast({
        title: "请选择买入日期",
        icon: "none",
      });
      return;
    }

    try {
      setLoading(true);

      const positionData: Omit<FundPosition, "currentValue" | "marketValue" | "profit" | "profitRate"> = {
        fundCode: fundInfo.code,
        fundName: fundInfo.name,
        shares: Number.parseFloat(shares),
        cost: Number.parseFloat(cost),
        buyDate,
      };

      let response;
      if (isEditMode) {
        response = await updatePosition(fundInfo.code, positionData);
      } else {
        response = await addPosition(positionData);
      }

      if (response.success) {
        // 重新从 API 加载所有数据,确保数据一致性
        await positionStore.loadAllData();

        Taro.showToast({
          title: isEditMode ? "更新成功" : "添加成功",
          icon: "success",
        });

        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({
          title: response.message || "操作失败",
          icon: "none",
        });
      }
    } catch (error) {
      console.error("提交失败:", error);
      Taro.showToast({
        title: "提交失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载热门基金列表
  useEffect(() => {
    const loadHotFunds = async () => {
      try {
        const response = await getHotFunds({ page: 1, pageSize: 1000 });
        if (response.success && response.data.list) {
          setHotFundsList(response.data.list);
        }
      } catch (error) {
        console.error("加载热门基金列表失败:", error);
      }
    };
    loadHotFunds();
  }, []);

  // 编辑模式下加载现有持仓数据
  useEffect(() => {
    if (isEditMode && initialFundCode) {
      loadExistingPosition();
    }
  }, [isEditMode, initialFundCode]);

  return (
    <PageWrapper
      title={isEditMode ? "编辑持仓" : "添加持仓"}
      showHeader
      headerStyle="centered"
      contentPadding={true}
      enableScroll={true}
    >
      <View className="space-y-32rpx">
        <Form>
          {/* 基金代码输入 */}
          <Cell>
            <View className="w-full">
              <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">
                基金代码 <Text className="text-red-500">*</Text>
              </Text>
              <View className="relative">
                <Input
                  placeholder="请输入6位基金代码"
                  value={fundCode}
                  onChange={handleFundCodeChange}
                  maxLength={6}
                  type="number"
                  disabled={isEditMode}
                />

                {/* 下拉提示列表 */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View className="absolute left-0 right-0 top-full z-10 mt-8rpx max-h-400rpx overflow-y-auto border border-gray-200 rounded-8rpx bg-white shadow-lg">
                    {filteredSuggestions.slice(0, 10).map(fund => (
                      <View
                        key={fund.code}
                        className="border-b border-gray-100 px-24rpx py-20rpx active:bg-gray-50"
                        onClick={() => handleSuggestionClick(fund)}
                      >
                        <View className="flex items-center justify-between">
                          <View className="flex-1">
                            <Text className="block text-28rpx text-gray-8 font-500">{fund.name}</Text>
                            <Text className="mt-4rpx block text-24rpx text-gray-5">{fund.code}</Text>
                          </View>
                          {fund.unitValue && (
                            <View className="ml-16rpx text-right">
                              <Text className="block text-26rpx text-gray-7">{formatFundValue(fund.unitValue)}</Text>
                              {fund.dayGrowthRate != null && (
                                <Text
                                  className="mt-4rpx block text-22rpx"
                                  style={{
                                    color:
                                      fund.dayGrowthRate > 0 ? "#f5222d" : fund.dayGrowthRate < 0 ? "#52c41a" : "#666",
                                  }}
                                >
                                  {fund.dayGrowthRate > 0 ? "+" : ""}
                                  {(fund.dayGrowthRate * 100).toFixed(2)}%
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Cell>

          {searching && (
            <Cell>
              <Text className="text-24rpx text-gray-5">搜索中...</Text>
            </Cell>
          )}

          {fundInfo && (
            <Cell className="rounded-8rpx bg-blue-50">
              <View>
                <Text className="block text-28rpx text-gray-8 font-500">{fundInfo.name}</Text>
                <Text className="mt-8rpx block text-24rpx text-gray-6">
                  当前净值: {formatFundValue(fundInfo.currentValue)}
                </Text>
              </View>
            </Cell>
          )}

          {/* 持有份额输入 */}
          <Cell>
            <View className="w-full">
              <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">
                持有份额 <Text className="text-red-500">*</Text>
              </Text>
              <Input placeholder="请输入持有份额" value={shares} onChange={handleSharesChange} type="digit" />
            </View>
          </Cell>

          {/* 成本金额输入 */}
          <Cell>
            <View className="w-full">
              <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">
                成本金额 (元) <Text className="text-red-500">*</Text>
              </Text>
              <Input placeholder="请输入总成本金额" value={cost} onChange={handleCostChange} type="digit" />
            </View>
          </Cell>

          {shares && cost && (
            <Cell>
              <Text className="text-24rpx text-gray-5">
                成本单价: {(Number.parseFloat(cost) / Number.parseFloat(shares)).toFixed(4)}
              </Text>
            </Cell>
          )}

          {/* 买入日期 */}
          <Cell>
            <View className="w-full">
              <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">
                买入日期 <Text className="text-red-500">*</Text>
              </Text>
              <Input placeholder="请选择买入日期" value={buyDate} onChange={handleBuyDateChange} type="text" />
            </View>
          </Cell>
        </Form>

        {/* 提交按钮 */}
        <View className="pt-40rpx">
          <Button
            type="primary"
            block
            loading={loading}
            disabled={loading || !fundInfo}
            onClick={handleSubmit}
            style={{
              opacity: loading || !fundInfo ? 0.6 : 1,
            }}
          >
            {isEditMode ? "更新持仓" : "添加持仓"}
          </Button>
        </View>

        {/* 风险提示 */}
        <Cell className="rounded-8rpx bg-yellow-50">
          <Text className="block text-24rpx text-orange-600">
            ⚠️ 风险提示: 基金投资有风险，过往业绩不代表未来表现。本功能仅用于记录持仓，不构成投资建议。
          </Text>
        </Cell>
      </View>
    </PageWrapper>
  );
}

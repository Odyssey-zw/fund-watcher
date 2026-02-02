import type { FundPosition } from "~/types/fund";
import { Button, Input, Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import { getSinaFundData } from "~/api/fund-internal";
import { addPosition, getPositions, updatePosition } from "~/api/position";
import PageWrapper from "~/components/page-wrapper";
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

  const [fundCode, setFundCode] = useState(initialFundCode || "");
  const [fundInfo, setFundInfo] = useState<FundInfo | null>(null);
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchFundInfo = async (code: string) => {
    if (!isValidFundCode(code)) {
      setFundInfo(null);
      return;
    }

    try {
      setSearching(true);
      const fundData = await getSinaFundData(code);

      if (fundData && fundData.name) {
        setFundInfo({
          code,
          name: fundData.name,
          currentValue: Number.parseFloat(fundData.gsz) || 0,
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
      const response = await getPositions();
      if (response.success) {
        const position = response.data.find(p => p.fundCode === initialFundCode);
        if (position) {
          setFundCode(position.fundCode);
          setShares(position.shares.toString());
          setCost(position.cost.toString());
          setBuyDate(position.buyDate);
          // 搜索基金信息
          searchFundInfo(position.fundCode);
        }
      }
    } catch (error) {
      console.error("加载持仓数据失败:", error);
    }
  };

  const handleFundCodeChange = (value: string) => {
    setFundCode(value);
    if (value.length === 6) {
      searchFundInfo(value);
    } else {
      setFundInfo(null);
    }
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
        {/* 基金代码输入 */}
        <View>
          <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">基金代码</Text>
          <Input
            className="h-88rpx w-full border border-gray-300 rounded-8rpx px-24rpx py-32rpx text-28rpx"
            placeholder="请输入6位基金代码"
            placeholderStyle="color: #9ca3af; font-size: 28rpx;"
            value={fundCode}
            onInput={e => handleFundCodeChange(e.detail.value)}
            maxlength={6}
            type="number"
            disabled={isEditMode}
          />
          {searching && <Text className="mt-12rpx block text-24rpx text-gray-5">搜索中...</Text>}
          {fundInfo && (
            <View className="mt-16rpx rounded-8rpx bg-blue-50 p-20rpx">
              <Text className="block text-28rpx text-gray-8 font-500">{fundInfo.name}</Text>
              <Text className="mt-8rpx block text-24rpx text-gray-6">
                当前净值: {formatFundValue(fundInfo.currentValue)}
              </Text>
            </View>
          )}
        </View>

        {/* 持有份额输入 */}
        <View>
          <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">持有份额</Text>
          <Input
            className="h-88rpx w-full border border-gray-300 rounded-8rpx px-24rpx py-32rpx text-28rpx"
            placeholder="请输入持有份额"
            placeholderStyle="color: #9ca3af; font-size: 28rpx;"
            value={shares}
            onInput={e => setShares(e.detail.value)}
            type="digit"
          />
        </View>

        {/* 成本金额输入 */}
        <View>
          <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">成本金额 (元)</Text>
          <Input
            className="h-88rpx w-full border border-gray-300 rounded-8rpx px-24rpx py-32rpx text-28rpx"
            placeholder="请输入总成本金额"
            placeholderStyle="color: #9ca3af; font-size: 28rpx;"
            value={cost}
            onInput={e => setCost(e.detail.value)}
            type="digit"
          />
          {shares && cost && (
            <Text className="mt-12rpx block text-24rpx text-gray-5">
              成本单价: {(Number.parseFloat(cost) / Number.parseFloat(shares)).toFixed(4)}
            </Text>
          )}
        </View>

        {/* 买入日期 */}
        <View>
          <Text className="mb-16rpx block text-28rpx text-gray-8 font-500">买入日期</Text>
          <Input
            className="h-88rpx w-full border border-gray-300 rounded-8rpx px-24rpx py-32rpx text-28rpx"
            placeholder="请选择买入日期"
            placeholderStyle="color: #9ca3af; font-size: 28rpx;"
            value={buyDate}
            onInput={e => setBuyDate(e.detail.value)}
          />
        </View>

        {/* 提交按钮 */}
        <View className="pt-40rpx">
          <Button
            className="w-full rounded-12rpx bg-primary-6 py-24rpx text-32rpx text-white"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !fundInfo}
          >
            {isEditMode ? "更新持仓" : "添加持仓"}
          </Button>
        </View>

        {/* 风险提示 */}
        <View className="rounded-8rpx bg-yellow-50 p-20rpx">
          <Text className="block text-24rpx text-orange-600">
            ⚠️ 风险提示: 基金投资有风险，过往业绩不代表未来表现。本功能仅用于记录持仓，不构成投资建议。
          </Text>
        </View>
      </View>
    </PageWrapper>
  );
}

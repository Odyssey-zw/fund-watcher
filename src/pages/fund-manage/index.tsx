import { Button, Input } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import PageWrapper from "~/components/page-wrapper";
import { useFundCodesStore } from "~/store/useFundCodesStore";

export default function FundManagePage() {
  const { fundCodes, addFundCode, removeFundCode, resetToDefault, updateFundName } = useFundCodesStore();
  const [newFundCode, setNewFundCode] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddFund = async () => {
    const code = newFundCode.trim();
    if (!code) {
      Taro.showToast({
        title: "请输入基金代码",
        icon: "none",
      });
      return;
    }

    // 验证基金代码格式（6位数字）
    if (!/^\d{6}$/.test(code)) {
      Taro.showToast({
        title: "基金代码格式错误",
        icon: "none",
      });
      return;
    }

    addFundCode(code);
    setNewFundCode("");
    Taro.showToast({
      title: "添加成功",
      icon: "success",
    });
  };

  const handleDeleteFund = (code: string) => {
    Taro.showModal({
      title: "确认删除",
      content: `确定要删除基金 ${code} 吗？`,
      success: res => {
        if (res.confirm) {
          removeFundCode(code);
          Taro.showToast({
            title: "删除成功",
            icon: "success",
          });
        }
      },
    });
  };

  const handleEditName = (code: string, currentName?: string) => {
    setEditingCode(code);
    setEditingName(currentName || "");
  };

  const handleSaveName = () => {
    if (editingCode && editingName.trim()) {
      updateFundName(editingCode, editingName.trim());
      setEditingCode(null);
      setEditingName("");
      Taro.showToast({
        title: "保存成功",
        icon: "success",
      });
    } else {
      setEditingCode(null);
      setEditingName("");
    }
  };

  const handleReset = () => {
    Taro.showModal({
      title: "确认重置",
      content: "确定要恢复默认基金列表吗？当前列表将被清空。",
      success: res => {
        if (res.confirm) {
          resetToDefault();
          Taro.showToast({
            title: "已恢复默认列表",
            icon: "success",
          });
        }
      },
    });
  };

  const handleBatchAdd = () => {
    // 使用一个简单的提示,引导用户手动输入
    // 由于 Taro.showModal 不支持输入框,这里简化处理
    Taro.showModal({
      title: "批量添加说明",
      content: "请在添加框中输入基金代码,多个代码可多次添加。如需批量导入,可在电脑端操作或使用其他工具。",
      showCancel: false,
      confirmText: "知道了",
    });
  };

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="基金管理" showHeader showBack headerStyle="centered">
          {/* 添加基金区域 */}
          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white p-24rpx">
            <View className="mb-16rpx text-28rpx text-gray-8 font-600">添加基金</View>
            <View className="flex gap-16rpx">
              <View className="flex-1">
                <Input
                  placeholder="输入6位基金代码"
                  value={newFundCode}
                  type="number"
                  maxLength={6}
                  onChange={value => setNewFundCode(value)}
                />
              </View>
              <Button type="primary" size="small" onClick={handleAddFund}>
                添加
              </Button>
            </View>
            <View className="mt-16rpx">
              <Button type="default" size="small" onClick={handleBatchAdd} style={{ width: "100%" }}>
                批量添加
              </Button>
            </View>
          </View>

          {/* 基金列表 */}
          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white">
            <View className="flex items-center justify-between border-b border-gray-2 px-24rpx py-16rpx">
              <Text className="text-28rpx text-gray-8 font-600">基金列表 ({fundCodes.length})</Text>
              <Text className="cursor-pointer text-24rpx text-primary-6" onClick={handleReset}>
                恢复默认
              </Text>
            </View>

            {fundCodes.length === 0 ? (
              <View className="p-40rpx text-center text-gray-5">
                <Text>暂无基金，请添加</Text>
              </View>
            ) : (
              <View className="max-h-800rpx overflow-y-auto">
                {fundCodes.map((item, index) => (
                  <View
                    key={item.code}
                    className={`px-24rpx py-20rpx flex items-center justify-between ${
                      index !== fundCodes.length - 1 ? "border-b border-gray-2" : ""
                    }`}
                  >
                    <View className="flex-1">
                      {editingCode === item.code ? (
                        <View className="flex gap-12rpx">
                          <Input
                            placeholder="输入基金名称"
                            value={editingName}
                            onChange={value => setEditingName(value)}
                            style={{ flex: 1 }}
                          />
                          <Button type="primary" size="mini" onClick={handleSaveName}>
                            保存
                          </Button>
                          <Button
                            type="default"
                            size="mini"
                            onClick={() => {
                              setEditingCode(null);
                              setEditingName("");
                            }}
                          >
                            取消
                          </Button>
                        </View>
                      ) : (
                        <View>
                          <View className="mb-4rpx flex items-center gap-12rpx">
                            <Text className="text-28rpx text-gray-8 font-500">{item.code}</Text>
                            <Text
                              className="cursor-pointer text-22rpx text-primary-6"
                              onClick={() => handleEditName(item.code, item.name)}
                            >
                              {item.name ? "编辑" : "添加备注"}
                            </Text>
                          </View>
                          {item.name && <Text className="text-24rpx text-gray-5">{item.name}</Text>}
                        </View>
                      )}
                    </View>

                    {editingCode !== item.code && (
                      <View className="ml-16rpx">
                        <Text
                          className="cursor-pointer text-26rpx text-red-5"
                          onClick={() => handleDeleteFund(item.code)}
                        >
                          删除
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 说明信息 */}
          <View className="mb-16rpx overflow-hidden rd-12rpx bg-blue-1 p-24rpx">
            <View className="mb-8rpx text-26rpx text-blue-6 font-600">使用说明</View>
            <View className="text-24rpx text-gray-6 leading-relaxed">
              <Text>• 基金代码为6位数字</Text>
              <Text>{"\n"}• 所有基金列表将基于此列表获取数据</Text>
              <Text>{"\n"}• 数据会自动保存到本地</Text>
              <Text>{"\n"}• 可添加备注名称便于识别</Text>
            </View>
          </View>
        </PageWrapper>
      </View>
    </View>
  );
}

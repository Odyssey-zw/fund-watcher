import { Button, Dialog, Input, Table } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import PageWrapper from "~/components/page-wrapper";
import { useFundCodesStore } from "~/store/useFundCodesStore";

export default function FundManagePage() {
  const {
    fundCodes,
    tags,
    addFundCode,
    addFundCodes,
    removeFundCode,
    resetToDefault,
    updateFundTags,
    addTag,
    updateTag,
    removeTag,
    hasFundCode,
    hasTagKey,
  } = useFundCodesStore();
  const [newFundCode, setNewFundCode] = useState("");
  const [showSingleAdd, setShowSingleAdd] = useState(false);
  const [batchDialogVisible, setBatchDialogVisible] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [tagKeyInput, setTagKeyInput] = useState("");
  const [tagValueInput, setTagValueInput] = useState("");
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [tagSelectVisible, setTagSelectVisible] = useState(false);
  const [tagSelectFundCode, setTagSelectFundCode] = useState<string | null>(null);
  const [tagSelectKeys, setTagSelectKeys] = useState<string[]>([]);

  const handleCancelSingleAdd = () => {
    setShowSingleAdd(false);
    setNewFundCode("");
  };

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

    if (hasFundCode(code)) {
      Taro.showToast({
        title: "该基金已存在",
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
    setBatchDialogVisible(true);
  };

  const handleConfirmBatchAdd = () => {
    const raw = batchInput.replace(/\s+/g, "");
    if (!raw) {
      setBatchDialogVisible(false);
      return;
    }
    const codes = raw.split(",").filter(code => /^\d{6}$/.test(code));
    if (codes.length === 0) {
      Taro.showToast({
        title: "请输入由英文逗号分隔的6位基金代码",
        icon: "none",
      });
      return;
    }
    addFundCodes(codes);
    setBatchDialogVisible(false);
    setBatchInput("");
    Taro.showToast({
      title: "批量添加成功",
      icon: "success",
    });
  };

  const handleAddTag = () => {
    const key = tagKeyInput.trim();
    const value = tagValueInput.trim();
    if (!key || !value) {
      Taro.showToast({
        title: "请输入完整标签",
        icon: "none",
      });
      return;
    }
    if (hasTagKey(key)) {
      Taro.showToast({
        title: "标签 key 已存在",
        icon: "none",
      });
      return;
    }
    addTag({ key, value });
    setTagKeyInput("");
    setTagValueInput("");
  };

  const handleUpdateTag = () => {
    if (!editingTagKey) {
      return;
    }
    const key = tagKeyInput.trim();
    const value = tagValueInput.trim();
    if (!key || !value) {
      Taro.showToast({
        title: "请输入完整标签",
        icon: "none",
      });
      return;
    }
    updateTag(editingTagKey, { key, value });
    setEditingTagKey(null);
    setTagKeyInput("");
    setTagValueInput("");
  };

  const handleEditTagRow = (key: string, value: string) => {
    setEditingTagKey(key);
    setTagKeyInput(key);
    setTagValueInput(value);
  };

  const openTagSelect = (code: string, currentKeys: string[] = []) => {
    if (tags.length === 0) {
      Taro.showToast({
        title: "请先在上方添加标签",
        icon: "none",
      });
      return;
    }
    setTagSelectFundCode(code);
    setTagSelectKeys(currentKeys);
    setTagSelectVisible(true);
  };

  const toggleTagKey = (key: string) => {
    setTagSelectKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const handleConfirmTagSelect = () => {
    if (!tagSelectFundCode) {
      setTagSelectVisible(false);
      return;
    }
    updateFundTags(tagSelectFundCode, tagSelectKeys);
    setTagSelectVisible(false);
  };

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="基金管理" showHeader showBack headerStyle="centered">
          {/* 标签管理模块 */}
          <View className="mb-16rpx overflow-hidden border border-gray-2 rd-12rpx bg-white p-24rpx shadow-sm">
            <View className="mb-12rpx flex items-center justify-between">
              <Text className="text-28rpx text-gray-8 font-600">标签管理</Text>
              <Text className="text-22rpx text-gray-5">为基金分组、渠道等打标</Text>
            </View>
            <View className="mb-16rpx flex items-center gap-12rpx">
              <View className="flex-1 rd-10rpx bg-gray-1 px-8rpx py-8rpx shadow-sm">
                <Input placeholder="例如：ZHIFUBAO" value={tagKeyInput} onChange={val => setTagKeyInput(val)} />
              </View>
              <View className="flex-1 rd-10rpx bg-gray-1 px-8rpx py-8rpx shadow-sm">
                <Input placeholder="例如：支付宝" value={tagValueInput} onChange={val => setTagValueInput(val)} />
              </View>
              {editingTagKey ? (
                <Button type="primary" size="small" onClick={handleUpdateTag}>
                  保存
                </Button>
              ) : (
                <Button type="primary" size="small" onClick={handleAddTag}>
                  新增
                </Button>
              )}
            </View>
            <Table
              columns={[
                { title: "Key", key: "key", align: "left" },
                { title: "标签名", key: "value", align: "left" },
                {
                  title: "操作",
                  key: "actions",
                  align: "right",
                  render: (row: any) => (
                    <View className="flex justify-end gap-16rpx">
                      <Text className="text-24rpx text-primary-6" onClick={() => handleEditTagRow(row.key, row.value)}>
                        编辑
                      </Text>
                      <Text className="text-24rpx text-red-5" onClick={() => removeTag(row.key)}>
                        删除
                      </Text>
                    </View>
                  ),
                },
              ]}
              data={tags}
              bordered={false}
              noData={<Text>暂无标签</Text>}
            />
          </View>

          {/* 基金列表模块 */}
          <View className="mb-16rpx overflow-hidden border border-gray-2 rd-12rpx bg-white p-24rpx shadow-sm">
            <View className="mb-16rpx flex items-center justify-between">
              <Text className="text-28rpx text-gray-8 font-600">基金列表管理</Text>
              <Text className="text-22rpx text-gray-5">管理基金代码列表</Text>
            </View>
            <View className="overflow-hidden rd-12rpx bg-white">
              <View className="mb-12rpx flex items-center justify-between">
                <Text className="text-28rpx text-gray-8 font-600">基金列表 ({fundCodes.length})</Text>

                <View className="flex gap-12rpx">
                  <Button type="primary" size="small" onClick={() => setShowSingleAdd(v => !v)}>
                    新增
                  </Button>
                  <Button type="default" size="small" onClick={handleBatchAdd}>
                    批量添加
                  </Button>
                  <Button type="default" size="small" onClick={handleReset}>
                    恢复默认
                  </Button>
                </View>
              </View>

              {showSingleAdd && (
                <View className="my-16rpx flex items-center gap-12rpx">
                  <View className="flex-1 rd-10rpx bg-gray-1 px-8rpx py-8rpx shadow-sm">
                    <Input
                      placeholder="输入6位基金代码"
                      value={newFundCode}
                      type="number"
                      maxLength={6}
                      onChange={value => setNewFundCode(value)}
                    />
                  </View>
                  <Button type="default" size="small" onClick={handleCancelSingleAdd}>
                    取消
                  </Button>
                  <Button type="primary" size="small" onClick={handleAddFund}>
                    确定
                  </Button>
                </View>
              )}

              {fundCodes.length === 0 ? (
                <View className="p-40rpx text-center text-gray-5">
                  <Text>暂无基金，请添加</Text>
                </View>
              ) : (
                <Table
                  columns={[
                    {
                      title: "基金代码",
                      key: "code",
                      align: "left",
                    },
                    {
                      title: "标签",
                      key: "tagKey",
                      align: "center",
                      render: (row: any) => {
                        const currentTags =
                          row.tagKeys && Array.isArray(row.tagKeys)
                            ? tags.filter(t => row.tagKeys.includes(t.key))
                            : [];
                        const label = currentTags.length > 0 ? currentTags.map(t => t.value).join(" / ") : "设置标签";
                        return (
                          <Text
                            className="text-24rpx text-primary-6"
                            onClick={() => openTagSelect(row.code, row.tagKeys || [])}
                          >
                            {label}
                          </Text>
                        );
                      },
                    },
                    {
                      title: "操作",
                      key: "actions",
                      align: "right",
                      render: (row: any) => (
                        <Text className="text-24rpx text-red-5" onClick={() => handleDeleteFund(row.code)}>
                          删除
                        </Text>
                      ),
                    },
                  ]}
                  data={fundCodes}
                  bordered={false}
                  noData={<Text>暂无基金，请添加</Text>}
                />
              )}
            </View>
          </View>

          {/* 批量添加弹框 */}
          <Dialog
            visible={batchDialogVisible}
            title="批量添加基金"
            onConfirm={handleConfirmBatchAdd}
            onCancel={() => setBatchDialogVisible(false)}
            lockScroll
          >
            <View className="p-16rpx">
              <Text className="mb-8rpx block text-24rpx text-gray-7">
                粘贴由英文逗号分隔的多个 6 位基金代码，例如：
              </Text>
              <Text className="mb-8rpx block text-24rpx text-gray-6">161725,320007,160225</Text>
              <Input
                type="text"
                placeholder="161725,320007,160225"
                value={batchInput}
                onChange={val => setBatchInput(val)}
              />
            </View>
          </Dialog>

          {/* 标签多选弹框 */}
          <Dialog
            visible={tagSelectVisible}
            title="选择标签"
            onConfirm={handleConfirmTagSelect}
            onCancel={() => setTagSelectVisible(false)}
            lockScroll
          >
            <View className="p-16rpx">
              {tags.map(tag => {
                const active = tagSelectKeys.includes(tag.key);
                return (
                  <View
                    key={tag.key}
                    className={`mb-12rpx flex items-center justify-between rounded-8rpx px-20rpx py-12rpx ${
                      active ? "bg-primary-1" : "bg-gray-1"
                    }`}
                    onClick={() => toggleTagKey(tag.key)}
                  >
                    <Text className="text-26rpx text-gray-8">{tag.value}</Text>
                    <Text className="text-24rpx text-primary-6">{active ? "已选" : "选择"}</Text>
                  </View>
                );
              })}
              {tags.length === 0 && <Text className="text-24rpx text-gray-6">暂无标签，请先在上方添加</Text>}
            </View>
          </Dialog>

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

#!/bin/bash
# 创建简单的PNG占位图标 (使用ImageMagick或其他工具)
# 这里我们创建一个简单的纯色正方形作为占位

# 检查是否有convert命令
if command -v convert &> /dev/null; then
    # 灰色图标
    convert -size 81x81 xc:'#999999' home.png
    convert -size 81x81 xc:'#999999' fund.png
    convert -size 81x81 xc:'#999999' position.png
    convert -size 81x81 xc:'#999999' profile.png
    
    # 蓝色激活图标
    convert -size 81x81 xc:'#1677ff' home-active.png
    convert -size 81x81 xc:'#1677ff' fund-active.png
    convert -size 81x81 xc:'#1677ff' position-active.png
    convert -size 81x81 xc:'#1677ff' profile-active.png
    
    echo "Icons created with ImageMagick"
else
    echo "ImageMagick not found, creating placeholder files"
    # 创建空文件作为占位
    touch home.png fund.png position.png profile.png
    touch home-active.png fund-active.png position-active.png profile-active.png
fi

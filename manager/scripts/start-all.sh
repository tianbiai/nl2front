#!/bin/bash

# ============================================
# 一键启动所有前端项目
# 使用方式: ./scripts/start-all.sh
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 日志目录
LOGS_DIR="$ROOT_DIR/logs"
mkdir -p "$LOGS_DIR"

# 项目配置
declare -A PROJECTS=(
    ["manager"]="$ROOT_DIR"
    ["admin"]="$ROOT_DIR/../projects/gas/admin"
    ["miniprogram"]="$ROOT_DIR/../projects/gas/miniprogram"
)

declare -A COMMANDS=(
    ["manager"]="npm run dev"
    ["admin"]="npm run dev"
    ["miniprogram"]="npm run dev:h5"
)

declare -A PORTS=(
    ["manager"]=3000
    ["admin"]=3002
    ["miniprogram"]=3001
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       一键启动所有前端项目${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查并安装依赖
check_and_install() {
    local name=$1
    local dir=$2

    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}[$name] 检测到未安装依赖，正在安装...${NC}"
        cd "$dir"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}[$name] 依赖安装失败！${NC}"
            return 1
        fi
        echo -e "${GREEN}[$name] 依赖安装完成${NC}"
    fi
    return 0
}

# 启动项目
start_project() {
    local name=$1
    local dir=$2
    local cmd=$3
    local port=$4

    echo -e "${GREEN}[$name] 正在启动... (端口: $port)${NC}"

    # 后台运行并输出日志 (使用 bash -c 确保命令正确执行)
    (cd "$dir" && bash -c "$cmd" > "$LOGS_DIR/${name}.log" 2>&1) &

    # 记录进程ID
    echo $! > "$LOGS_DIR/${name}.pid"

    echo -e "${GREEN}[$name] 已启动 (PID: $(cat "$LOGS_DIR/${name}.pid"))${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING > /dev/null; then
        return 0  # 端口已被占用
    fi
    return 1  # 端口未被占用
}

# 主流程
echo -e "${YELLOW}Step 1: 检查依赖...${NC}"
echo ""

for name in "${!PROJECTS[@]}"; do
    dir="${PROJECTS[$name]}"
    # 转换为绝对路径
    dir="$(cd "$dir" 2>/dev/null && pwd)"

    if [ ! -d "$dir" ]; then
        echo -e "${RED}[$name] 项目目录不存在: $dir${NC}"
        continue
    fi

    check_and_install "$name" "$dir"
done

echo ""
echo -e "${YELLOW}Step 2: 启动项目...${NC}"
echo ""

for name in "${!PROJECTS[@]}"; do
    dir="${PROJECTS[$name]}"
    dir="$(cd "$dir" 2>/dev/null && pwd)"

    if [ ! -d "$dir" ]; then
        continue
    fi

    port="${PORTS[$name]}"
    cmd="${COMMANDS[$name]}"

    # 检查端口是否已被占用
    if check_port "$port"; then
        echo -e "${YELLOW}[$name] 端口 $port 已被占用，跳过启动${NC}"
        continue
    fi

    start_project "$name" "$dir" "$cmd" "$port"
    sleep 2  # 错开启动时间，避免资源竞争
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}所有项目启动完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "访问地址:"
echo -e "  ${GREEN}Manager:${NC}      http://localhost:3000"
echo -e "  ${GREEN}Admin:${NC}        http://localhost:3002"
echo -e "  ${GREEN}Miniprogram:${NC}  http://localhost:3001"
echo ""
echo -e "日志目录: $LOGS_DIR"
echo -e "查看日志: tail -f $LOGS_DIR/*.log"
echo ""

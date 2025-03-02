#!/bin/bash

# Проверка, что интерпретатор работает
echo "Скрипт запущен"

# Имя текущего скрипта
SCRIPT_NAME=$(basename "$0")

# Функция для формирования пути с учетом глубины
get_path_prefix() {
    local depth=$1
    local prefix="../"  # Начинаем с минимального "../"
    for ((i=1; i<depth; i++)); do
        prefix="../${prefix}"
    done
    echo "$prefix"
}

# Функция для обработки файлов
replace_text() {
    local current_depth=$1
    
    for file in *; do
        if [ -e "$file" ]; then
            if [ -d "$file" ] && [ "$file" != "." ] && [ "$file" != ".." ]; then
                cd "$file"
                replace_text $((current_depth + 1))
                cd ..
            elif [ -f "$file" ] && [ "$file" != "$SCRIPT_NAME" ]; then
                local path_prefix=$(get_path_prefix "$current_depth")
                grep -o "@welshman/[[:alnum:]_-]*" "$file" 2>/dev/null | sort -u | while read -r match; do
                    local key=$(echo "$match" | sed 's#@welshman/##')
                    local replacement="${path_prefix}${key}/index.js"
                    sed -i "s#${match}\"#${replacement}\"#g" "$file" 2>/dev/null
                    sed -i "s#${match}'#${replacement}'#g" "$file" 2>/dev/null
                    sed -i "s#${match}\([[:space:]]\|$\)#${replacement}\1#g" "$file" 2>/dev/null
                done
            fi
        fi
    done
}

echo "Начинаем замену @welshman/* на ../*/index.js с учетом глубины..."
replace_text 0
echo "Замена завершена!"

echo "Измененные файлы:"
find . -type f -not -name "$SCRIPT_NAME" -exec grep -l "[.][.][/].*/index.js" {} \;

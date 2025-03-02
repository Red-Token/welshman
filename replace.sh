#!/bin/bash

# Функция для обработки файлов
replace_text() {
    # Проходим по всем файлам и папкам в текущей директории
    for file in *; do
        # Проверяем, существует ли элемент
        if [ -e "$file" ]; then
            # Если это директория и не точка или двойная точка
            if [ -d "$file" ] && [ "$file" != "." ] && [ "$file" != ".." ]; then
                # Рекурсивно заходим в поддиректорию
                cd "$file"
                replace_text
                cd ..
            # Если это обычный файл
            elif [ -f "$file" ]; then
                # Используем sed для замены текста во всех файлах
                sed -i 's#@welshman/util#../util.index.js#g' "$file" 2>/dev/null
            fi
        fi
    done
}

# Запускаем функцию из текущей директории
echo "Начинаем замену @welshman/util на ../util.index.js..."
replace_text
echo "Замена завершена!"

# Выводим статистику измененных файлов
echo "Измененные файлы:"
find . -type f -exec grep -l "../util.index.js" {} \;

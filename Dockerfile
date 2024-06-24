# Usar a imagem oficial do PHP 8.2
FROM php:8.2-fpm

# Instalar extensões necessárias do PHP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar o diretório de trabalho
WORKDIR /var/www

# Copiar o conteúdo do projeto para o diretório de trabalho
COPY . /var/www

# Garantir que os diretórios existam
RUN mkdir -p /var/www/storage /var/www/bootstrap/cache

# Dar permissão ao diretório de cache e logs
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Executar o Composer para instalar as dependências do Lumen
RUN composer install

# Expor a porta que o PHP-FPM irá escutar
EXPOSE 9000

# Comando para iniciar o PHP-FPM
CMD ["php-fpm"]

# Usar a imagem oficial do PHP 8.2
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

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
    imagemagick \
    libmagickwand-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install imagick \
    && docker-php-ext-enable imagick

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy the existing application directory contents to the working directory
COPY . /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Criar o link simbólico para storage
RUN php artisan storage:link

# Set appropriate permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expor a porta que o PHP-FPM irá escutar
EXPOSE 9000

# Comando para iniciar o PHP-FPM
CMD ["php-fpm"]

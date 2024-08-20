# ベースイメージとして公式のRubyイメージを使用
FROM ruby:3.3.4

# Node.jsとYarnをインストール
RUN apt-get update -qq && apt-get install -y nodejs npm
RUN npm install -g yarn

# 必要なディレクトリを作成
RUN mkdir /app
WORKDIR /app

# GemfileとGemfile.lockをコピーして、Gemをインストール
COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock
RUN bundle install

# package.jsonとyarn.lockをコピーして、Node.jsパッケージをインストール
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install

# アプリケーションの全ファイルをコピー
COPY . /app

# ポート3000を公開
EXPOSE 3000

# データベースの準備とサーバーの起動
CMD ["bash", "-c", "rm -f tmp/pids/server.pid && bundle exec rails db:migrate && bundle exec rails s -b '0.0.0.0'"]
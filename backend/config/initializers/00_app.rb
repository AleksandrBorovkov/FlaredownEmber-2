module Flaredown

  def self.config
    Flaredown::Settings.instance
  end

  def self.session
    Flaredown::Session.instance
  end

  class Session
    include Singleton, ActiveModel::Serialization
  end

  class Settings
    include Singleton

    def redis_url
      ENV["REDISCLOUD_URL"].present? ? ENV['REDISCLOUD_URL'] : ENV['REDIS_URL']
    end
  end

end
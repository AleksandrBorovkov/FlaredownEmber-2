class WeatherRetriever
  def self.get(date, postal_code)
    weather = Weather.find_by(date: date, postal_code: postal_code)

    return weather if weather.present?

    position = Geocoder.search(postal_code).first
    tz = Time.zone
    Time.zone = NearestTimeZone.to(position.latitude, position.longitude)

    forecast = ForecastIO.forecast(
      position.latitude,
      position.longitude,
      time: Time.zone.parse(date.to_s).to_i,
      params: { exclude: 'minutely,hourly,alerts,flags' }
    )

    Time.zone = tz

    if Rails.application.secrets.debug
      Rails.logger.info("\nThe forecast for #{date} and #{postal_code} is:\n#{forecast.to_yaml}\n")
    end

    Weather.create(
      underscore_keys(permitted(forecast.daily.data.first)).merge(
        date: Date.strptime(forecast.daily.data.first.time.to_s, '%s'),
        postal_code: postal_code
      )
    )
  end

  class << self
    private

    def underscore_keys(hash)
      hash.map { |k, v| [k.underscore, v] }.to_h
    end

    def permitted(hash)
      hash.slice(:icon, :temperatureMin, :temperatureMax, :precipIntensity, :pressure, :humidity)
    end
  end
end

namespace :oneoff do

  task build_trackable_usages: :environment do
    build_trackable_usages
  end
  def build_trackable_usages
    TrackableUsage.delete_all
    User.all.each do |user|
      Rails.logger.info("[#{__method__}] === #{user.email} ===")
      user.checkins.each do |checkin|
        Rails.logger.info("[#{__method__}] --- #{checkin.date.strftime('%Y-%m-%d')} ---")
        Rails.logger.info("[#{__method__}] --- Conditions ---")
        checkin.conditions.each do |condition|
          trackable = Condition.find(condition.condition_id)
          usage = TrackableUsage.create_or_update_by(user: user, trackable: trackable)
          Rails.logger.info("[#{__method__}] - #{trackable.name}: #{usage.count}")
        end
        Rails.logger.info("[#{__method__}] --- Symptoms ---")
        checkin.symptoms.each do |symptom|
          trackable = Symptom.find(symptom.symptom_id)
          usage = TrackableUsage.create_or_update_by(user: user, trackable: trackable)
          Rails.logger.info("[#{__method__}] - #{trackable.name}: #{usage.count}")
        end
        Rails.logger.info("[#{__method__}] --- Treatments ---")
        checkin.treatments.each do |treatment|
          trackable = Treatment.find(treatment.treatment_id)
          usage = TrackableUsage.create_or_update_by(user: user, trackable: trackable)
          Rails.logger.info("[#{__method__}] - #{trackable.name}: #{usage.count}")
        end
      end
    end
  end

  task fix_trackable_colors: :environment do
    fix_trackable_colors
  end
  def fix_trackable_colors
    colors = (0..32).to_a
    User.all.each do |user|
      Rails.logger.info("[#{__method__}] === #{user.email} ===")
      colors_hash = Hash.new
      user.checkins.each do |checkin|
        Rails.logger.info("[#{__method__}] --- #{checkin.date.strftime('%Y-%m-%d')} ---")
        used_colors = Array.new
        fix_and_store_color_id = lambda do |checkin_trackable, trackable_type|
          trackable_id = checkin_trackable.send("#{trackable_type.downcase}_id")
          key = "#{trackable_type}-#{trackable_id}"
          if colors_hash[key].present?
            checkin_trackable.update_attributes!(color_id: colors_hash[key])
          else
            if checkin_trackable.color_id.nil?
              trackable = trackable_type.constantize.find(trackable_id)
              checkin_trackable.color_id = Flaredown::Colorable.color_id_for(trackable, user)
            end
            if used_colors.include?(checkin_trackable.color_id)
              if used_colors.count >= colors.count
                checkin_trackable.color_id = used_colors.count % colors.count
              else
                checkin_trackable.color_id = (colors - used_colors).sample
              end
            end
            checkin_trackable.save!
            colors_hash[key] = checkin_trackable.color_id
            used_colors << checkin_trackable.color_id
          end
        end
        Rails.logger.info("[#{__method__}] --- Conditions ---")
        checkin.conditions.each do |condition|
          fix_and_store_color_id.call(condition, "Condition")
        end
        Rails.logger.info("[#{__method__}] --- Symptoms ---")
        checkin.symptoms.each do |symptom|
          fix_and_store_color_id.call(symptom, "Symptom")
        end
        Rails.logger.info("[#{__method__}] --- Treatments ---")
        checkin.treatments.each do |treatment|
          fix_and_store_color_id.call(treatment, "Treatment")
        end
      end
      user.trackings.active_at(Time.now).each do |tracking|
        key = "#{tracking.trackable_type.downcase}-#{tracking.trackable_id}"
        tracking.update_attributes!(color_id: colors_hash[key]) if colors_hash[key].present?
      end
      Rails.logger.info("[#{__method__}] Colors: #{colors_hash}")
    end
  end

end

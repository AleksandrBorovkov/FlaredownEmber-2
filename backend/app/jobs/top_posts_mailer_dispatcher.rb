class TopPostsMailerDispatcher
  include Sidekiq::Worker

  def perform
    Profile.where(notify_top_posts: true).each do |profile|
      GroupTopPostsJob.perform_async(notify_token: profile.notify_token)
    end
  end
end

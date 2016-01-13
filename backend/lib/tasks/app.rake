namespace :app do
  desc 'flaredown | setup application'
  task setup: :environment do
    setup
  end

  class OperationAbortedException < StandardError; end

  def setup
    puts 'This will create the necessary stuff. You will lose any previous data stored'
    ask_to_continue

    build_database

  rescue OperationAbortedException
    puts "\nQuitting...".red
    exit 1
  end

  def build_database
    header 'build database'
    Rake::Task['db:schema:load'].invoke
    Rake::Task['db:seed'].invoke
  rescue PG::ObjectInUse => e
    puts "\n#{e.message}.".red
  end

  def header(message)
    puts ">>> #{message}".bold.blue
  end

  def ask_to_continue
    answer = prompt('Do you want to continue (yes/no)? ', %w(yes no))
    fail OperationAbortedException unless answer.eql?('yes')
  end

  def prompt(message, choices = nil)
    begin
      print(message)
      answer = STDIN.gets.chomp
    end while choices.present? && !choices.include?(answer)
    answer
  rescue Interrupt
    fail OperationAbortedException
  end

end

require 'rake'

desc "run application"
task :run do
  pids = [
    spawn("cd backend && foreman start -f Procfile.local"),
    spawn("cd frontend && rm -rfd ./dist && ./node_modules/.bin/ember serve --port 4300 --proxy http://localhost:3000")
  ]

  trap "INT" do
    Process.kill "INT", *pids
    exit 1
  end

  pids.each do |pid|
    Process.wait pid
  end
end

namespace :heroku do
  desc "deploy application"
  task :deploy do
    system("git subtree push --prefix backend git@heroku.com:flaredown-api.git master")
    system("git subtree push --prefix frontend git@heroku.com:flaredown-webapp.git master")
  end

  desc "setup application"
  task :setup do
    system("heroku pg:reset DATABASE --app flaredown-api --confirm flaredown-api")
    system("heroku run rake app:setup --app flaredown-api")
  end

end

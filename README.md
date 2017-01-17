# flaredown

## Environment

* PostgreSQL 9.4
* MongoDB 3.0.10
* Redis 3.2.6
* Ruby 2.3.1 (see [RVM](https://rvm.io/) also)
* Node 9.6.1

## Installation

### Backend

```bash
cd backend
echo "gem: --no-ri --no-rdoc" > ~/.gemrc
bundle install --without production -j5 --retry 10
cp env-example .env # You may adjust it however you like
                    # RVM is going to autoload this on every 'cd' to the dirrectory
bundle exec rake app:setup
```

### Frontend

```bash
cd frontend
npm install
bower install
```

## Running / Development

```bash
rake run
```

Visit your app at [http://localhost:4300](http://localhost:4300)


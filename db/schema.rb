# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100415031027) do

  create_table "figures", :force => true do |t|
    t.integer "map_id",                                   :null => false
    t.integer "position_x"
    t.integer "position_y"
    t.string  "character",  :limit => 1,                  :null => false
    t.string  "size",       :limit => 1, :default => "M", :null => false
  end

  add_index "figures", ["map_id"], :name => "index_figures_on_map_id"

  create_table "maps", :force => true do |t|
    t.integer "origin_x"
    t.integer "origin_y"
    t.integer "width"
    t.integer "height"
  end

  create_table "walls", :force => true do |t|
    t.integer "map_id", :null => false
    t.integer "x0",     :null => false
    t.integer "y0",     :null => false
    t.integer "x1",     :null => false
    t.integer "y1",     :null => false
  end

  add_index "walls", ["map_id"], :name => "index_walls_on_map_id"

end

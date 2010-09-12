# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100830020228) do

  create_table "characters", :force => true do |t|
    t.string "letter", :limit => 1,                  :null => false
    t.string "size",   :limit => 1, :default => "M"
  end

  create_table "colors", :force => true do |t|
    t.integer "palette_id", :null => false
    t.float   "red",        :null => false
    t.float   "green",      :null => false
    t.float   "blue",       :null => false
    t.float   "alpha",      :null => false
    t.string  "kind"
  end

  add_index "colors", ["palette_id", "kind"], :name => "index_colors_on_palette_id_and_kind"

  create_table "effects", :force => true do |t|
    t.integer "map_id",                   :null => false
    t.string  "shape",       :limit => 6, :null => false
    t.integer "x",                        :null => false
    t.integer "y",                        :null => false
    t.integer "size",                     :null => false
    t.float   "orientation"
  end

  add_index "effects", ["map_id"], :name => "index_effects_on_map_id"

  create_table "figures", :force => true do |t|
    t.integer  "map_id",                                     :null => false
    t.integer  "position_x"
    t.integer  "position_y"
    t.string   "letter",       :limit => 1,                  :null => false
    t.string   "size",         :limit => 1, :default => "M", :null => false
    t.integer  "character_id"
    t.datetime "deleted_at"
    t.string   "kind",                                       :null => false
    t.integer  "color_id"
  end

  add_index "figures", ["character_id"], :name => "index_figures_on_character_id"
  add_index "figures", ["map_id"], :name => "index_figures_on_map_id"

  create_table "images", :force => true do |t|
    t.integer   "map_id",                              :null => false
    t.float     "x"
    t.float     "y"
    t.float     "width",              :default => 1.0, :null => false
    t.float     "height",             :default => 1.0, :null => false
    t.string    "image_file_name"
    t.string    "image_content_type"
    t.integer   "image_file_size"
    t.timestamp "image_updated_at"
    t.integer   "image_width",        :default => 0,   :null => false
    t.integer   "image_height",       :default => 0,   :null => false
  end

  add_index "images", ["map_id"], :name => "index_images_on_map_id"

  create_table "maps", :force => true do |t|
    t.string "name"
  end

  create_table "palettes", :force => true do |t|
    t.integer "map_id"
  end

  add_index "palettes", ["map_id"], :name => "index_palettes_on_map_id", :unique => true

  create_table "vertices", :force => true do |t|
    t.integer "wall_id", :null => false
    t.float   "x",       :null => false
    t.float   "y",       :null => false
  end

  add_index "vertices", ["wall_id"], :name => "index_vertices_on_wall_id"

  create_table "walls", :force => true do |t|
    t.integer "map_id",                                  :null => false
    t.string  "kind",   :limit => 7, :default => "wall", :null => false
  end

  add_index "walls", ["map_id"], :name => "index_walls_on_map_id"

end

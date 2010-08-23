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

ActiveRecord::Schema.define(:version => 20100823021244) do

  create_table "characters", :force => true do |t|
    t.string "letter", :limit => 1,                  :null => false
    t.string "size",   :limit => 1, :default => "M"
  end

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
  end

  add_index "figures", ["character_id"], :name => "index_figures_on_character_id"
  add_index "figures", ["map_id"], :name => "index_figures_on_map_id"

  create_table "images", :force => true do |t|
    t.integer  "map_id",                              :null => false
    t.float    "x"
    t.float    "y"
    t.float    "width",              :default => 1.0, :null => false
    t.float    "height",             :default => 1.0, :null => false
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "image_width",        :default => 0,   :null => false
    t.integer  "image_height",       :default => 0,   :null => false
  end

  add_index "images", ["map_id"], :name => "index_images_on_map_id"

  create_table "maps", :force => true do |t|
    t.string   "name"
    t.integer  "user_id"
    t.datetime "loaded_at"
  end

  add_index "maps", ["user_id", "loaded_at"], :name => "index_maps_on_user_id_and_loaded_at"

  create_table "users", :force => true do |t|
    t.string   "email",                               :default => "", :null => false
    t.string   "encrypted_password",   :limit => 128, :default => "", :null => false
    t.string   "password_salt",                       :default => "", :null => false
    t.string   "reset_password_token"
    t.string   "remember_token"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                       :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "vertices", :force => true do |t|
    t.integer "wall_id", :null => false
    t.float   "x",       :null => false
    t.float   "y",       :null => false
  end

  add_index "vertices", ["wall_id"], :name => "index_vertices_on_wall_id"

  create_table "walls", :force => true do |t|
    t.integer "map_id",              :null => false
    t.string  "kind",   :limit => 7
  end

  add_index "walls", ["map_id"], :name => "index_walls_on_map_id"

end

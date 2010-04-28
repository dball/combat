class AddImages < ActiveRecord::Migration
  def self.up
    create_table :images do |t|
      t.integer :map_id, :null => false
      t.float :x
      t.float :y
      t.float :width, :null => false, :default => 1
      t.float :height, :null => false, :default => 1
      t.string :image_file_name
      t.string :image_content_type
      t.integer :image_file_size
      t.datetime :image_updated_at
    end
    add_index :images, :map_id
  end

  def self.down
    drop_table :images
  end
end

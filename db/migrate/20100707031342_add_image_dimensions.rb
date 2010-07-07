class AddImageDimensions < ActiveRecord::Migration
  def self.up
    change_table :images do |t|
      t.integer :image_width, :null => false, :default => 0
      t.integer :image_height, :null => false, :default => 0
    end
  end

  def self.down
    t.remove :image_width
    t.remove :image_height
  end
end

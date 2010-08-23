class AddDrawings < ActiveRecord::Migration
  def self.up
    change_table :walls do |t|
      t.string :kind, :limit => 7, :default => 'wall', :null => false
    end
    change_column :vertices, :x, :float, :null => false
    change_column :vertices, :y, :float, :null => false
  end

  def self.down
    change_column :vertices, :y, :integer, :null => false
    change_column :vertices, :x, :integer, :null => false
    change_table :walls do |t|
      t.remove :kind
    end
  end
end

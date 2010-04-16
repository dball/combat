class CreateCharacters < ActiveRecord::Migration
  def self.up
    create_table :characters do |t|
      t.string :letter, :limit => 1, :null => false
      t.string :size, :limit => 1, :default => 'M'
    end
    change_table :figures do |t|
      t.integer :character_id
    end
    add_index :figures, :character_id
  end

  def self.down
    change_table :figures do |t|
      t.remove :character_id
    end
    drop_table :characters
  end
end

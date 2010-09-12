class AddColors < ActiveRecord::Migration
  def self.up
    create_table :palettes do |t|
      t.integer :map_id
    end
    add_index :palettes, :map_id, :unique => true
    Palette.create!

    create_table :colors do |t|
      t.integer :palette_id, :null => false
      t.float :red, :null => false
      t.float :green, :null => false
      t.float :blue, :null => false
      t.float :alpha, :null => false
      t.string :kind
    end
    add_index :colors, [:palette_id, :kind]

    add_column :figures, :kind, :string
    Figure.all.each do |figure|
      figure.kind = case figure.letter
        when /[A-Z]/ then 'actor'
        when /[a-z]/ then 'extra'
        when /\s/ then 'set'
        when 'ʘ' then 'set'
        else 'prop'
      end
      figure.save!
    end
    change_column :figures, :kind, :string, :null => false
    add_column :figures, :color_id, :integer
  end

  def self.down
    remove_column :figures, :color_id
    remove_column :figures, :kind

    drop_table :colors

    drop_table :palettes
  end
end

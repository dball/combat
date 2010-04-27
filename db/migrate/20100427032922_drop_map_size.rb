class DropMapSize < ActiveRecord::Migration
  def self.up
    change_table :maps do |t|
      t.remove :origin_x
      t.remove :origin_y
      t.remove :width
      t.remove :height
    end
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end

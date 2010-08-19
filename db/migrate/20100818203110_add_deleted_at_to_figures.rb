class AddDeletedAtToFigures < ActiveRecord::Migration
  def self.up
    change_table :figures do |t|
      t.datetime :deleted_at
    end
  end

  def self.down
    change_table :figures do |t|
      t.remove :deleted_at
    end
  end
end

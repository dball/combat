require 'spec/spec_helper'

describe Viewport do
  before do
    @map = Map.create
  end

  context "aspect ratio 1" do
    before do
      @viewport = Viewport.new(@map, :aspect => 1)
    end

    context "empty" do
      it "should be 20x20 and be centered on (0,0)" do
        @viewport.center.should == { :x => 0, :y => 0 }
        @viewport.size.should == { :width => 20, :height => 20 }
      end

      it "should pan 5 pixels to the left" do
        @viewport.pan('-', 'x')
        @viewport.center.should == { :x => -5, :y => 0 }
        @viewport.size.should == { :width => 20, :height => 20 }
      end
    end

    context "one figure" do
      before do
        @map.figures.build(:position_x => 2, :position_y => -1)
        @viewport.reset(@map)
      end

      it "should be 20x20 and be centered on the figure" do
        @viewport.center.should == { :x => 2, :y => -1 }
        @viewport.size.should == { :width => 20, :height => 20 }
      end
    end

    context "many figures" do
      before do
        figures = @map.figures
        (-5 .. -1).each {|i| figures.build(:position_x => i, :position_y => i) }
        @viewport.reset(@map)
      end

      it "should be 20x20 and be centered on figures' bounding box" do
        @viewport.center.should == { :x => -3, :y => -3 }
        @viewport.size.should == { :width => 20, :height => 20 }
      end
    end

    context "wide" do
      before do
        figures = @map.figures
        [-10, 11].each {|i| figures.build(:position_x => i, :position_y => 0) }
        @viewport.reset(@map)
      end

      it "should be 21x21 and be centered between the figures" do
        @viewport.center.should == { :x => 0.5, :y => 0 }
        @viewport.size.should == { :width => 21, :height => 21 }
      end
    end

    context "tall" do
      before do
        figures = @map.figures
        [-11, 10].each {|i| figures.build(:position_x => 0, :position_y => i) }
        @viewport.reset(@map)
      end

      it "should be 21x21 and be centered between the figures" do
        @viewport.size.should == { :width => 21, :height => 21 }
        @viewport.center.should == { :x => 0, :y => -0.5 }
      end
    end

    context "wide & tall" do
      before do
        figures = @map.figures
        [-11, 11].each {|i| figures.build(:position_x => -i, :position_y => i) }
        @viewport.reset(@map)
      end

      it "should be 22x22 and be centered on figures' bounding box" do
        @viewport.size.should == { :width => 22, :height => 22 }
        @viewport.center.should == { :x => 0, :y => 0 }
      end
    end
  end

  context "aspect ratio 2" do
    before do
      @viewport = Viewport.new(@map, :aspect => '2.0')
    end

    context "empty" do
      it "should be 40x20 and be centered on (0,0)" do
        @viewport.center.should == { :x => 0, :y => 0 }
        @viewport.size.should == { :width => 40, :height => 20 }
      end
    end

    context "one figure" do
      before do
        @map.figures.build(:position_x => 2, :position_y => -1)
        @viewport.reset(@map)
      end

      it "should be 40x20 and be centered on the figure" do
        @viewport.center.should == { :x => 2, :y => -1 }
        @viewport.size.should == { :width => 40, :height => 20 }
      end
    end

    context "many figures" do
      before do
        figures = @map.figures
        (-5 .. -1).each {|i| figures.build(:position_x => i, :position_y => i) }
        @viewport.reset(@map)
      end

      it "should be 40x20 and be centered on figures' bounding box" do
        @viewport.center.should == { :x => -3, :y => -3 }
        @viewport.size.should == { :width => 40, :height => 20 }
      end
    end

    context "minimally wide" do
      before do
        figures = @map.figures
        [-10, 11].each {|i| figures.build(:position_x => i, :position_y => 0) }
        @viewport.reset(@map)
      end

      it "should be 40x20 and be centered between the figures" do
        @viewport.center.should == { :x => 0.5, :y => 0 }
        @viewport.size.should == { :width => 40, :height => 20 }
      end
    end

    context "wide" do
      before do
        figures = @map.figures
        [-20, 21].each {|i| figures.build(:position_x => i, :position_y => 0) }
        @viewport.reset(@map)
      end

      it "should be 41x20.5 and be centered between the figures" do
        @viewport.center.should == { :x => 0.5, :y => 0 }
        @viewport.size.should == { :width => 41, :height => 20.5 }
      end
    end

    # tall, tall & wide are tested in aspect ratio 1
  end
end

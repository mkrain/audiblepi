using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;

using Holdem.Interfaces.Model;

namespace BuiltToRoam.WindowsPhone.Controls
{
	public class Wheel : ListBox, INotifyPropertyChanged
	{
		public event EventHandler<VisualStateChangedEventArgs> CurrentStateChanging;

		public ScrollViewer Scroller { get; set; }
		public Storyboard SnapAnimation { get; set; }

		public Border TopStop { get; set; }
		public Border BottomStop { get; set; }

		bool _alreadyHookedScrollEvents;
		bool _hasFocus;

		VisualState _currentState = new VisualState();
		public Wheel()
		{
			DefaultStyleKey = typeof(Wheel);
			
			SelectionChanged += WheelBase_SelectionChanged;
			Loaded += WheelBase_Loaded;
			SizeChanged += WheelBase_SizeChanged;
			
			GotFocus += WheelBase_GotFocus;
			LostFocus += WheelBase_LostFocus;
			MouseEnter += Wheel_MouseEnter;
			MouseLeave += Wheel_MouseLeave;
		}

		bool _userClickedOnItem;
		void Wheel_MouseLeave(object sender, MouseEventArgs e)
		{
			if (_currentState.Name == "NotScrolling" || _currentState.Name == "")
				_userClickedOnItem = false;
		}

		void Wheel_MouseEnter(object sender, MouseEventArgs e)
		{
			_userClickedOnItem = true;
		}

		void WheelBase_LostFocus(object sender, RoutedEventArgs e)
		{
			_hasFocus = false;
			SnapToGrid();
			UpdateFocus();
		}

		void UpdateFocus()
		{
		    if( _userClickedOnItem )
		        return;

		    foreach( var item in this.GetItems() )
		        item.IsVisible = ( item == this.SelectedItem );
		}

	    void WheelBase_GotFocus(object sender, RoutedEventArgs e)
		{
			_hasFocus = true;

            foreach (var item in GetItems().Where(item => !item.IsVisible))
				item.IsVisible = true;
		}

        private IEnumerable<IScrollWheelItem> GetItems()
        {
            return Items.OfType<IScrollWheelItem>();
        }

		public override void OnApplyTemplate()
		{
			base.OnApplyTemplate();

			try
			{
				SnapAnimation = GetTemplateChild("SnapAnimation") as Storyboard;

				Scroller = GetTemplateChild("Scroller") as ScrollViewer;
				
				if(Scroller != null)
					Scroller.ManipulationCompleted += Scroller_ManipulationCompleted;
				TopStop = GetTemplateChild("TopStop") as Border;
				BottomStop = GetTemplateChild("BottomStop") as Border;
			}
			catch (Exception ex)
			{

			}
		}

		// user flicked
		void Scroller_ManipulationCompleted(object sender, ManipulationCompletedEventArgs e)
		{
			_userClickedOnItem = false;
		}
		
		void WheelBase_SizeChanged(object sender, SizeChangedEventArgs e)
		{
			UpdateStops();
		}

		void UpdateStops()
		{
			try
			{
				if (TopStop != null)
				{
					TopStop.Height = (ActualHeight - ItemHeight) / 2;
					BottomStop.Height = TopStop.Height;
				}

				if (SelectedIndex >= 0)
					ScrollToOffset(SelectedIndex * ItemHeight);
			}
			catch
			{

			}
		}

		
		private void InvokeCurrentStateChanging(VisualStateChangedEventArgs e)
		{
			var handler = CurrentStateChanging;

			if (handler != null)
				handler(this, e);
		}

		void WheelBase_Loaded(object sender, RoutedEventArgs e)
		{
			if (Items.Count > 0 && SelectedIndex < 0)
				SelectedIndex = 0;

			UpdateFocus();

			if (_alreadyHookedScrollEvents)
				return;

			_alreadyHookedScrollEvents = true;
			var viewer = FindSimpleVisualChild<ScrollViewer>(this);

			if (viewer != null)
			{
				// Visual States are always on the first child of the control template 
				var element = VisualTreeHelper.GetChild(viewer, 0) as FrameworkElement;

				if (element != null)
				{
					var group = FindVisualState(element, "ScrollStates");

					if (group != null)
					{
						group.CurrentStateChanging += (s, args) =>
						                              	{
						                              		InvokeCurrentStateChanging(args);
						                              		_currentState = args.NewState;

															if (_currentState.Name == "NotScrolling" && !_userClickedOnItem)
																SnapToGrid();
						                              	};
					}
				}
			}
		}

		void WheelBase_SelectionChanged(object sender, SelectionChangedEventArgs e)
		{
			if (SelectedIndex >= 0)
			{
				ScrollToOffset(SelectedIndex * ItemHeight);
			}

			if(!_hasFocus)
				UpdateFocus();
		}



		private double _currentScrollOffset = 0;
		private int _ItemHeight = 10;

		public int ItemHeight
		{
			get { return _ItemHeight; }
			set
			{
				if (_ItemHeight == value) return;
				_ItemHeight = value;
				UpdateStops();
				RaisePropertyChanged("ItemHeight");
			}
		}

		private bool IsFirst = true;
		protected override void PrepareContainerForItemOverride(DependencyObject element, object item)
		{
			if (IsFirst)
			{
				var felement = (element as FrameworkElement);
				if (felement != null)
				{
					IsFirst = false;
					ItemHeight = (int)felement.ActualHeight;
					felement.SizeChanged += felement_SizeChanged;
				}
			}
			base.PrepareContainerForItemOverride(element, item);
		}

		void felement_SizeChanged(object sender, SizeChangedEventArgs e)
		{
			if (e.NewSize.Height > 0)
			{
				ItemHeight = (int)e.NewSize.Height;
			}

		}

		private void SnapToGrid()
		{
			var relativeScrollModulo = Scroller.VerticalOffset % ItemHeight;
			double animationToOffset;

			if (relativeScrollModulo == 0)
			{
				animationToOffset = Scroller.VerticalOffset;
			}
			else if (relativeScrollModulo >= Math.Floor(ItemHeight / 2.0))
			{
				// go to the next item
				animationToOffset = Scroller.VerticalOffset - relativeScrollModulo + ItemHeight;
			}
			else
			{
				// got to the previous item
				animationToOffset = Scroller.VerticalOffset - relativeScrollModulo;
			}

			ScrollToOffset(animationToOffset);
			
			var index = GetSelectedIndexFromOffset(animationToOffset);

			if (index < 0)
				SelectedIndex = 0;
			else if (index >= Items.Count)
				SelectedIndex = Items.Count - 1;
			else
				SelectedIndex = index;
		}

		private void ScrollToOffset(double destinationOffset)
		{
			if (double.IsNaN(destinationOffset)) return;
			_currentScrollOffset = destinationOffset;

			if (SnapAnimation == null)
				return;

			var animation = ((DoubleAnimation) SnapAnimation.Children[0]);
			animation.From = Scroller.VerticalOffset;
			animation.To = destinationOffset;
			SnapAnimation.Begin();
		}

		private int GetSelectedIndexFromOffset(double offset)
		{
			return (int)Math.Floor(_currentScrollOffset / ItemHeight);
		}


		public event PropertyChangedEventHandler PropertyChanged;

		private void RaisePropertyChanged(string propertyName)
		{
			if (PropertyChanged != null)
			{
				PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
		}


		static VisualStateGroup FindVisualState(FrameworkElement element, string name)
		{
			if (element == null)
				return null;

			var groups = VisualStateManager.GetVisualStateGroups(element);
			return groups.Cast<VisualStateGroup>().FirstOrDefault(group => group.Name == name);
		}

		static T FindSimpleVisualChild<T>(DependencyObject element) where T : class
		{
			while (element != null)
			{

				if (element is T)
					return element as T;

				element = VisualTreeHelper.GetChild(element, 0);
			}

			return null;
		}


	}
}
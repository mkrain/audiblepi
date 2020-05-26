// http://joel.neubeck.net/2008/09/templated-silverlight-rating-control/
using System.Windows;
using System.Windows.Controls.Primitives;
using System.Windows.Input;

namespace Coding4Fun.AppsListControl
{
    [TemplateVisualState(Name = StatePressed, GroupName = GroupCommon)]
    [TemplateVisualState(Name = StateNormal, GroupName = GroupCommon)]
    [TemplateVisualState(Name = StateMouseOver, GroupName = GroupCommon)]
    [TemplateVisualState(Name = StateDisabled, GroupName = GroupCommon)]
    [TemplateVisualState(Name = StateContentFocused, GroupName = GroupFocus)]
    [TemplateVisualState(Name = StateUnfocused, GroupName = GroupFocus)]
    [TemplateVisualState(Name = StateFocused, GroupName = GroupFocus)]
    [TemplateVisualState(Name = StateUnchecked, GroupName = GroupCheck)]
    [TemplateVisualState(Name = StateChecked, GroupName = GroupCheck)]
    [TemplateVisualState(Name = StateIndeterminate, GroupName = GroupCheck)]
    public class RatingButton: ToggleButton
    {
        internal const string GroupCommon = "CommonStates";
        internal const string GroupFocus = "FocusStates";
        internal const string GroupCheck = "CheckStates";

        internal const string StateDisabled = "Disabled";
        internal const string StateMouseOver = "MouseOver";
        internal const string StateNormal = "Normal";
        internal const string StateIndeterminate = "Indeterminate";
        internal const string StatePressed = "Pressed";
        internal const string StateContentFocused = "ContentFocused";
        internal const string StateFocused = "Focused";
        internal const string StateUnfocused = "Unfocused";
        internal const string StateUnchecked = "Unchecked";
        internal const string StateChecked = "Checked";

        public static readonly DependencyProperty TextProperty =
            DependencyProperty.Register("Text", typeof(string), typeof(RatingButton), null);
        public string Text
        {
            get { return (string)GetValue(TextProperty); }
            set { SetValue(TextProperty, value); }
        }

        private double _rating = 0;
        public double Rating
        {
            get { return _rating; }
            set { _rating = value; }
        }
        private RatingControl _ratingControl;
        public RatingControl RatingControl
        {
            get { return _ratingControl; }
            set { _ratingControl = value; }
        }
        public RatingButton()
        {
            base.DefaultStyleKey = typeof(RatingButton);
            this.IsThreeState = true;
        }

        protected override void OnToggle()
        {
            bool? isChecked = this.IsChecked;
            if (isChecked == true)
            {
                this.IsChecked = false;
            }
            _ratingControl.UpdateChecked(this);
            _ratingControl.UpdateState(this, StateMouseOver);
        }

        protected override void OnMouseEnter(MouseEventArgs e)
        {
            _ratingControl.UpdateState(this, StateMouseOver);
            //e.Handled = true;
        }
        protected override void OnMouseLeave(MouseEventArgs e)
        {
            _ratingControl.UpdateState(this, StateNormal);
            //e.Handled = true;
        }
        

        public override string ToString()
        {
            return string.Concat(base.ToString(), "(", _rating.ToString(), ")");
        }
    }
}

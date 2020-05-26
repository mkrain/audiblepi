// http://joel.neubeck.net/2008/09/templated-silverlight-rating-control/
using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace Coding4Fun.AppsListControl
{
    public delegate void RateHandler(object sender, RatingButton button);    
    
    [TemplateVisualState(Name = StateDisabled, GroupName = GroupCommon)]
    [TemplatePart(Name = IndicatorsElement, Type = typeof(TextBlock))]
    public class RatingControl: ContentControl
    {
        internal const string GroupCommon = "CommonStates";
        internal const string StateDisabled = "Disabled";
        internal const string IndicatorsElement = "Indicators";

        private Panel _panelElement;
        private TextBlock _indicatorsElement;
        private string _indicatorsTemplate; 
        private List<WeakReference> _ratingElements = new List<WeakReference>();

        public event RateHandler Rate;

        public static readonly DependencyProperty MaxProperty =
            DependencyProperty.Register("Max", typeof(Int32), typeof(RatingControl), null);

        public Int32 Max
        {
            get { return (Int32)GetValue(MaxProperty); }
            set { SetValue(MaxProperty, value); }
        }

        public static readonly DependencyProperty ScoreProperty =
            DependencyProperty.Register("Score", typeof(double), typeof(RatingControl),null);

        public double Score
        {
            get { return (double)GetValue(ScoreProperty); }
            set { SetValue(ScoreProperty, value); }
        }
        public static readonly DependencyProperty TotalProperty =
            DependencyProperty.Register("Total", typeof(double), typeof(RatingControl),null);

        public double Total
        {
            get { return (double)GetValue(TotalProperty); }
            set { SetValue(TotalProperty, value); }
        }

        public static readonly DependencyProperty UseIndicatorsProperty =
            DependencyProperty.Register("UseIndicators", typeof(bool), typeof(RatingControl),null);

        public bool UseIndicators
        {
            get { return (bool)GetValue(UseIndicatorsProperty); }
            set { SetValue(UseIndicatorsProperty, value); }
        }

        
        public RatingControl()
        {
            DefaultStyleKey = typeof(RatingControl);
            this.Loaded += new RoutedEventHandler(RatingControl_Loaded);
        }

        void RatingControl_Loaded(object sender, RoutedEventArgs e)
        {
            if (base.Content != null)
            {
                _panelElement = base.Content as Panel;
                if (_panelElement != null)
                {
                    this.Max = _panelElement.Children.Count;
                    PopulateControl(true);
                }
            }
            else
            {
                StackPanel panel = new StackPanel();
                panel.Orientation = Orientation.Horizontal;

                _panelElement = panel;
                this.Content = _panelElement;
                PopulateControl(false);
            }
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            if (_indicatorsElement == null)
            {
                _indicatorsElement = GetTemplateChild(IndicatorsElement) as TextBlock;
                if (_indicatorsElement != null)
                {
                    _indicatorsTemplate = _indicatorsElement.Text;
                    UpdateLabel();
                }
            }
        }

        private void PopulateControl(bool existing)
        {
            for (int i = 0; i < this.Max; i++)
            {
                RatingButton button;
                if (existing)
                    button = _panelElement.Children[i] as RatingButton;
                else
                {
                    button = new RatingButton();
                    _panelElement.Children.Add(button);
                }

                button.Rating = i + 1;
                button.RatingControl = this;
                button.IsChecked = CalculateIsChecked(button.Rating, this.Score);

                button.Click += new RoutedEventHandler(button_Click);
                _ratingElements.Add(new WeakReference(button));
            }

        }

        void button_Click(object sender, RoutedEventArgs e)
        {
            RatingButton b = sender as RatingButton;
            UpdateLabel();
            OnRate(b);
        }

        private void UpdateLabel()
        {
            string temp = _indicatorsTemplate;
            temp = temp.Replace("%Max%", this.Max.ToString());
            temp = temp.Replace("%Score%", this.Score.ToString("#0.##"));
            temp = temp.Replace("%Total%", this.Total.ToString());
            _indicatorsElement.Text = temp;
        }

        internal void UpdateState(RatingButton b, string state)
        {
            int index = 0;
            while (index < _ratingElements.Count)
            {
                RatingButton target = _ratingElements[index].Target as RatingButton;
                if (target != null)
                {
                    if ((target == b))
                    {
                        if (state.Equals(RatingButton.StateMouseOver)&& UseIndicators)
                        {
                            if (b.Text != null )
                                _indicatorsElement.Text = b.Text;
                        }
                        else
                            UpdateLabel();
                        VisualStateManager.GoToState(target, state, true);
                        return;
                    }
                    else
                        VisualStateManager.GoToState(target, state, true);
                    index++;
                }
            }
        }
        
        internal void UpdateChecked(RatingButton b)
        {
            this.Total++;
            if(this.Score == 0)
                this.Score = b.Rating;
            else
                this.Score = ((this.Score + b.Rating) / 2);

            int index = 0;
            while (index < _ratingElements.Count)
            {
                RatingButton target = _ratingElements[index].Target as RatingButton;
                if (target != null)
                {
                    target.IsChecked = CalculateIsChecked(target.Rating,this.Score);
                    index++;
                }
            }
        }

        private bool? CalculateIsChecked(double rating, double score)
        {
            if(score <=0)
                return false;

            double fractional = score - rating;
            double floor = Math.Floor(score);
            if ((rating <= floor))
                return true; //full
            else if ((fractional < -.3) && (fractional > -.7))
                return null; //half
            if (fractional > -.3)
                return true; //full
            else if (rating > floor)
                return false; //none
            else
                return false;
        }

        protected void OnRate(RatingButton button)
        {
            if (Rate != null)
            {
                Rate(this,button);
            }
        }
    }
}

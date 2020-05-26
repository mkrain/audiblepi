using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.IO.IsolatedStorage;
using System.Linq;
using System.Net;
using System.ServiceModel.Syndication;
using System.Windows;
using System.Windows.Controls;
using System.Xml;
using Microsoft.Phone.Tasks;

namespace Coding4Fun.AppsListControl
{
    [TemplateVisualState(Name = "Normal", GroupName = "VisualStateGroup")]
    [TemplateVisualState(Name = "Loading", GroupName = "VisualStateGroup")]
    [TemplateVisualState(Name = "Error", GroupName = "VisualStateGroup")]
    public partial class PublisherAppsControl : UserControl
    {
        public SafeObservableCollection<MarketplaceApp> Apps { get; set; }
        private const string Root = "http://marketplaceedgeservice.windowsphone.com";

        public PublisherAppsControl()
        {
            InitializeComponent();
            Apps = new SafeObservableCollection<MarketplaceApp>();
            DataContext = this;
        }

        public string PublisherName
        {
            get { return (string)GetValue(PublisherNameProperty); }
            set { SetValue(PublisherNameProperty, value); }
        }

        public static readonly DependencyProperty PublisherNameProperty =
            DependencyProperty.Register("PublisherName", typeof(string), typeof(PublisherAppsControl), new PropertyMetadata(null, PublisherNameChanged));

        private static void PublisherNameChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            var ctrl = (PublisherAppsControl) sender;
            if (ctrl == null || DesignerProperties.GetIsInDesignMode(ctrl)) return;
            try
            {
                UpdateMarketplaceFeed(ctrl);
            }
            catch
            {
                ctrl.Dispatcher.BeginInvoke(() => VisualStateManager.GoToState(ctrl, "Error", false));
            }
        }

        private static void UpdateMarketplaceFeed(PublisherAppsControl ctrl)
        {
            IEnumerable<MarketplaceApp> items = null;

            if (IsolatedStorageSettings.ApplicationSettings.Contains("PublisherAppsControls.Items"))
            {
                items = (IEnumerable<MarketplaceApp>)IsolatedStorageSettings.ApplicationSettings["PublisherAppsControls.Items"];
                // Use the cache if within a day...
                var dt = (DateTime)IsolatedStorageSettings.ApplicationSettings["PublisherAppsControls.Items.DateTime"];
                if (DateTime.Now.Subtract(dt).TotalDays < 1)
                {
                    ctrl.Apps.Clear();
                    foreach (var i in items) ctrl.Apps.Add(i);

                    ctrl.Dispatcher.BeginInvoke(() => VisualStateManager.GoToState(ctrl, "Normal", false));

                    return;
                }
            }

            var name = System.Uri.EscapeUriString((string)ctrl.GetValue(PublisherNameProperty));

            VisualStateManager.GoToState(ctrl, "Loading", false);

            var c = new WebClient();
            c.DownloadStringCompleted += (o, e) => { 

                ctrl.Apps.Clear();
                
                if (e.Error == null)
                {
                    try
                    {
                        ParseItemFeed(e.Result, ctrl.Apps);

                        if (IsolatedStorageSettings.ApplicationSettings.Contains("PublisherAppsControls.Items"))
                            IsolatedStorageSettings.ApplicationSettings.Remove("PublisherAppsControls.Items");
                        IsolatedStorageSettings.ApplicationSettings.Add("PublisherAppsControls.Items", ctrl.Apps);

                        if (IsolatedStorageSettings.ApplicationSettings.Contains("PublisherAppsControls.Items.DateTime"))
                            IsolatedStorageSettings.ApplicationSettings.Remove("PublisherAppsControls.Items.DateTime");
                        IsolatedStorageSettings.ApplicationSettings.Add("PublisherAppsControls.Items.DateTime", DateTime.Now);
                        
                        IsolatedStorageSettings.ApplicationSettings.Save();

                        ctrl.Dispatcher.BeginInvoke(() => VisualStateManager.GoToState(ctrl, "Normal", false));
                        return;
                    }
                    catch
                    {
                        ctrl.Dispatcher.BeginInvoke(() => VisualStateManager.GoToState(ctrl, "Error", false));
                    }
                }
                else ctrl.Dispatcher.BeginInvoke(() => VisualStateManager.GoToState(ctrl, "Error", false));

                // Fallback to cache...
                if (items != null) foreach (var i in items) ctrl.Apps.Add(i);
            };

            c.DownloadStringAsync(new Uri(Root + "/v3.2/en-US/apps?q=" + name + "&orderBy=Title&store=Zest&clientType=WinMobile+7.1"));
        }

        private static string ParseItemFeed(string xml, ObservableCollection<MarketplaceApp> apps)
        {
            using (var reader = XmlReader.Create(new StringReader(xml)))
            {
                var feed = SyndicationFeed.Load(reader);
                foreach( var item in feed.Items)
                {
                    var id = item.Id.Split(':')[2];

                    var app = new MarketplaceApp
                    {
                        Id = id,
                        AppLink = "http://windowsphone.com/s?appid=" + id,
                        Title = item.Title.Text,
                        ShortDescription = GetExtensionElementValue<string>(item, "shortDescription"),
                        UserRatingCount = GetExtensionElementValue<int>(item, "userRatingCount"),
                        Version = GetExtensionElementValue<string>(item, "version"),
                        AverageUserRating = GetExtensionElementValue<double>(item, "averageUserRating") / 2.0,
                        ReleaseDate = GetExtensionElementValue<string>(item, "releaseDate"),
                        PrimaryImageUrl = Root + "/v3.2/en-US/apps/" + id + "/primaryImage?width=95&height=95&resize=true",
                        DisplayPrice = "Unknown"
                    };

                    var offers = item.ElementExtensions.Where(ee => ee.OuterName == "offers").FirstOrDefault().GetReader();

                    // TODO: Restrict to current country's offer
                    if (offers.ReadToFollowing("offer"))
                    {
                        while(offers.Read())
                        {
                            if (offers.NodeType == XmlNodeType.Element)
                            {
                                if (offers.Name == "displayPrice") app.DisplayPrice = offers.ReadElementContentAsString();
                                else if (offers.Name == "priceCurrencyCode") app.PriceCurrencyCode = offers.ReadElementContentAsString();
                            }
                        }
                    }

                    if (app.DisplayPrice.Contains("0.00")) app.DisplayPrice = "Free";

                    apps.Add(app);
                }
                var link = feed.Links.Where(l => l.RelationshipType == "prev").FirstOrDefault();
                if (link != null)
                {
                    return Root + link.Uri.OriginalString;
                }
            }
            return null;
        }

        private static T GetExtensionElementValue<T>(SyndicationItem item, string extensionElementName)
        {
            var f = item.ElementExtensions.Where(ee => ee.OuterName == extensionElementName).FirstOrDefault();
            return f == null ? default(T) : f.GetObject<T>();
        }

        private void ListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var lb = (ListBox) sender;
            if (lb.SelectedIndex == -1) return;
            var app = (MarketplaceApp) lb.SelectedItem;
            var marketplaceDetailTask = new MarketplaceDetailTask {ContentIdentifier = app.Id};
            lb.SelectedIndex = -1;
            marketplaceDetailTask.Show();
        }
    }
}
